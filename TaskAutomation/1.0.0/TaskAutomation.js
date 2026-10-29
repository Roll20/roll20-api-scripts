/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: TaskAutomation
 * Script: TaskAutomation.js
 * Version: 1.0.0
 * Built: 2026-10-29T08:32:19.450Z
 */
const TaskAutomationMod = (() => {
  'use strict';

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'TaskAutomation';
  const SCRIPT_VERSION = '1.0.0';
  const SCRIPT_LAST_UPDATED = '2026-10-29T08:32:19.450Z';

  const DEFAULT_LOCALE$1 = 'en-US';

  const STATE_KEY = 'TaskAutomation';
  // Persistent state layout version. Definitions carry their own schemaVersion.
  const SCHEMA_VERSION = 1;
  const DEFINITION_SCHEMA_VERSION = 1;
  const COMMAND = '!taskautomation';

  const HANDOUT_DASHBOARD_NAME = 'TaskAutomation - Dashboard';
  const HANDOUT_HELP_NAME = 'TaskAutomation - Help';
  const HANDOUT_PLAYER_NAME = 'TaskAutomation - Player View';
  const HANDOUT_EXPORT_NAME = 'TaskAutomation - Export';

  const AUTHOR_LINKS = {
    maintainer: {
      name: 'MidNiteShadow7',
      github: 'https://github.com/steverobertsuk',
    },
  };

  // Instance states (plan §4).
  const STATUS = Object.freeze({
    QUEUED: 'queued',
    RUNNING: 'running',
    WAITING: 'waiting',
    PAUSED: 'paused',
    REVIEW: 'review',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
  });
  const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancelled', 'expired']);
  const ACTIVE_STATUSES = new Set(['queued', 'running', 'waiting', 'paused', 'review']);

  // Typed error codes shared by commands, run journals and the dashboard (plan §10).
  const ERROR_CODES = Object.freeze({
    VALIDATION: 'validation',
    UNAUTHORIZED: 'unauthorized',
    MISSING_TARGET: 'missingTarget',
    UNAVAILABLE: 'unavailable',
    CONFLICT: 'conflict',
    TIMEOUT: 'timeout',
    UNCERTAIN: 'uncertain',
    RESOURCE_LIMIT: 'resourceLimit',
    RUNAWAY: 'runaway',
    STALE: 'stale',
    INTERNAL: 'internal',
  });

  // Replay classes for actions (plan §8.1). `ephemeral` is a non-idempotent
  // visual effect (ping, spawned effect) whose uncertain outcome is skipped
  // rather than replayed or reviewed.
  const REPLAY = Object.freeze({
    PURE: 'pure',
    IDEMPOTENT: 'idempotent',
    NON_IDEMPOTENT: 'nonIdempotent',
    ACKNOWLEDGED: 'acknowledged',
    EPHEMERAL: 'ephemeral',
    INTERNAL: 'internal',
  });

  // Scheduler job kinds.
  const JOB = Object.freeze({
    OCCURRENCE: 'occurrence',
    CONTINUE: 'continue',
    RETRY: 'retry',
    DEBOUNCE: 'debounce',
    AWAIT_TIMEOUT: 'awaitTimeout',
    ASYNC_TIMEOUT: 'asyncTimeout',
    QUEUE_EXPIRY: 'queueExpiry',
    DASHBOARD: 'dashboard',
    MAINTENANCE: 'maintenance',
    CHECKPOINT: 'checkpoint',
    RECOVERY: 'recovery',
  });

  // Lower numbers run first when two jobs share a deadline. Time always wins.
  const JOB_PRIORITY = Object.freeze({
    recovery: 0,
    continue: 10,
    retry: 10,
    awaitTimeout: 10,
    asyncTimeout: 10,
    occurrence: 20,
    debounce: 20,
    queueExpiry: 30,
    dashboard: 40,
    checkpoint: 50,
    maintenance: 60,
  });

  // Scheduler safeguards (plan §3.1). Tunable application limits, not Roll20 quotas.
  const SCHEDULER_DEFAULTS = Object.freeze({
    maxJobsPerDrain: 25,
    maxDrainMs: 15,
    yieldMs: 10,
    // Conservative ceiling below the 2^31-1 ms host limit; long waits re-check on wake.
    maxHostDelayMs: 2_147_000_000,
    compactRatio: 0.5,
    compactMinimum: 64,
  });

  // Product defaults from plan §12.1, enforced again at runtime.
  const DEFAULT_LIMITS = Object.freeze({
    definitions: 100,
    activeInstances: 100,
    branchesPerRun: 10,
    nestingDepth: 8,
    loopIterations: 100,
    consecutiveSteps: 500,
    stepsPerJob: 50,
    queuedPerDefinition: 100,
    catchUpPerGroup: 10,
    minIntervalMs: 1000,
    minWaitMs: 100,
    targetsPerChunk: 20,
    payloadBytes: 32 * 1024,
    importBytes: 256 * 1024,
    stateBytes: 1024 * 1024,
    ancestryDepth: 8,
    descendantsPerRun: 50,
    stepsPerDefinition: 500,
    expressionDepth: 16,
    expressionNodes: 200,
    stringLength: 2000,
    nameLength: 100,
    historyRuns: 200,
    auditEntries: 1000,
    openIncidents: 100,
    timelinePerRun: 50,
    queryResults: 20,
    admissionsPerMinute: 60,
    playerCommandsPerMinute: 30,
    burstPerTrigger: 20,
    echoWindowMs: 1500,
    chatPerMinute: 30,
    writesPerJob: 40,
    awaitTimeoutMaxMs: 7 * 24 * 60 * 60 * 1000,
  });

  // Timing defaults (plan §7.2, §9).
  const TIMING = Object.freeze({
    graceMs: 250,
    lateWindowMs: 5 * 60 * 1000,
    dashboardSpacingMs: 2000,
    dashboardCoalesceMs: 500,
    dashboardMaxDirtyMs: 5000,
    confirmationTtlMs: 5 * 60 * 1000,
    importTtlMs: 10 * 60 * 1000,
    asyncTimeoutMs: 30 * 1000,
    maintenanceMs: 10 * 60 * 1000,
    recreateHandoutMs: 60 * 1000,
    recoverySummaryMs: 60 * 1000,
    clockJumpMs: 5000,
  });

  // Default configuration for new installs.
  const DEFAULT_CONFIG = {
    language: DEFAULT_LOCALE$1,
    dashboardRows: 25,
    playerView: false,
    diagnostics: false,
    checkpointMs: 0,
    privateChatTriggers: false,
    roundAnchor: 'Round',
    graceMs: TIMING.graceMs,
    lateWindowMs: TIMING.lateWindowMs,
  };

  // Settings the GM can change on the Mod's page in the API Scripts screen.
  const USEROPTION_KEYS = ['dashboardRows', 'playerView', 'diagnostics'];

  const DASHBOARD_ROW_OPTIONS = [10, 25, 50];

  // Dashboard sections, in navigation order.
  const DASHBOARD_VIEWS = [
    'overview',
    'definitions',
    'instances',
    'queue',
    'incidents',
    'history',
    'integrations',
  ];

  // Duration units accepted by commands (plan §13). Months and years are
  // deliberately absent: they are not fixed lengths.
  const DURATION_UNITS = Object.freeze({
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  });

  const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  // Token properties a task may read or watch, and the ones `token.set` may write.
  const TOKEN_READ_PROPERTIES = [
    'name',
    'left',
    'top',
    'width',
    'height',
    'rotation',
    'layer',
    'pageid',
    'represents',
    'bar1_value',
    'bar1_max',
    'bar2_value',
    'bar2_max',
    'bar3_value',
    'bar3_max',
    'statusmarkers',
    'tint_color',
    'currentSide',
    'controlledby',
    'fliph',
    'flipv',
    'showname',
  ];
  const TOKEN_WRITE_PROPERTIES = {
    left: 'number',
    top: 'number',
    rotation: 'number',
    layer: 'layer',
    bar1_value: 'bar',
    bar1_max: 'bar',
    bar2_value: 'bar',
    bar2_max: 'bar',
    bar3_value: 'bar',
    bar3_max: 'bar',
    tint_color: 'color',
    fliph: 'boolean',
    flipv: 'boolean',
    showname: 'boolean',
    name: 'string',
  };
  // Writes only a GM-authority run may make.
  const TOKEN_GM_PROPERTIES = new Set(['layer', 'name']);
  const LAYERS = ['objects', 'gmlayer', 'map', 'walls', 'foreground'];

  const ATTRIBUTE_READ_PROPERTIES = ['name', 'current', 'max', 'characterid'];
  const CHARACTER_READ_PROPERTIES = ['name', 'controlledby', 'inplayerjournals'];
  const PLAYER_READ_PROPERTIES = ['displayname', 'online'];
  const PAGE_READ_PROPERTIES = ['name', 'width', 'height'];

  // Built-in visual effects that `effect.spawn` accepts without GM approval.
  const FX_TYPES = [
    'bomb',
    'bubbling',
    'burn',
    'burst',
    'explode',
    'glow',
    'missile',
    'nova',
    'splatter',
  ];
  const FX_COLORS = [
    'acid',
    'blood',
    'charm',
    'death',
    'fire',
    'frost',
    'holy',
    'magic',
    'slime',
    'smoke',
    'water',
  ];

  // Commands listed by `help` and the Help handout, with their help keys.
  const HELP_COMMANDS = [
    ['', 'menu'],
    ['help', 'help'],
    ['dashboard open|refresh|view <section> [<page>]', 'dashboard'],
    ['definition list|show|create|validate|publish', 'definition'],
    ['definition enable|disable|clone|archive|purge', 'definitionManage'],
    ['definition set|param|binding|access|policy|trigger|step', 'definitionEdit'],
    ['definition export|import', 'definitionTransfer'],
    ['template list|add <name>', 'template'],
    ['instance start|dry-run --definition <id>', 'instanceStart'],
    ['instance list|inspect|pause|resume|cancel|rerun', 'instance'],
    ['instance decide --id <run> --action <choice>', 'instanceDecide'],
    ['schedule add|list|pause|resume|remove|offset', 'schedule'],
    ['signal <name> [--value <v>]', 'signal'],
    ['report missed|runs|audit|diagnostics', 'report'],
    ['recovery preview|apply|acknowledge', 'recovery'],
    ['config show|set <key> <value>', 'config'],
    ['adapter list', 'adapter'],
    ['stop-all --preview|--confirm <token>', 'stopAll'],
    ['resume-all', 'resumeAll'],
  ];

  // Colour palette for chat cards and handouts, shared with the other MidNiteShadow7 Mods.
  const COLOR_HEADER_BG = '#1d2a3a';
  const COLOR_HEADER_TEXT = '#e6edf5';
  const COLOR_CARD_BG_TOP = '#26394f';
  const COLOR_CARD_BG_BOTTOM = '#17222f';
  const COLOR_BORDER = '#3a5573';
  const COLOR_TEXT = '#e2e8f0';
  const COLOR_MUTED = '#9aabbd';
  const COLOR_ACCENT = '#f6ae2d';
  const COLOR_BUTTON_BG = '#33658a';
  const COLOR_BUTTON_TEXT = '#ffffff';
  const COLOR_BUTTON_ALT_BG = '#24384d';
  const COLOR_BUTTON_ALT_BORDER = '#4a6a8c';
  const COLOR_DANGER_BG = '#8a2c2c';
  const COLOR_OK = '#7bd389';
  const COLOR_ERROR_BG = '#fee2e2';
  const COLOR_ERROR_BORDER = '#991b1b';
  const COLOR_ERROR_TEXT = '#991b1b';

  // Small helpers with no Roll20 globals, so they can be unit tested directly.

  const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

  /**
   * Returns true when a value is a plain non-null, non-array object.
   *
   * @param {*} value Value to test.
   * @returns {boolean} True when the value is a record.
   */
  function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Converts a value to trimmed text, treating null and undefined as empty.
   *
   * @param {*} value Value to convert.
   * @returns {string} Trimmed string.
   */
  function toText(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  /**
   * Escapes HTML special characters for text and attribute contexts.
   *
   * @param {*} text Text to escape.
   * @returns {string} Escaped text.
   */
  function escapeHtml(text) {
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
  function neutraliseChatText(text) {
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
  function parseStrictInt(raw) {
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
  function parseStrictNumber(raw) {
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
  function parseBoolean(raw) {
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
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /**
   * Parses a duration such as `500ms`, `10s`, `5m`, `2h` or `1d`. A bare
   * number is rejected because its unit would be ambiguous.
   *
   * @param {*} raw Raw input.
   * @returns {number|null} Milliseconds, or null when invalid.
   */
  function parseDuration(raw) {
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
  function formatDuration(ms) {
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
  function parseIsoInstant(raw) {
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
  function parseUtcOffset(raw) {
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
  function formatUtcOffset(minutes) {
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
  function formatUtc(ms) {
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
  function tokenize(text) {
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
  function quoteArg(value) {
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
  function isSafeKey(key) {
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
  function checkPlainData(value, { maxDepth = 32, maxNodes = 20000, maxString = 20000 } = {}) {
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
        return node.length <= maxString
          ? { ok: true }
          : { ok: false, error: 'stringTooLong', path };
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
  function parseJsonSafe(text, maxBytes) {
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
  function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  /**
   * Returns the UTF-8 byte length of text.
   *
   * @param {string} text Text.
   * @returns {number} Bytes.
   */
  function byteLength(text) {
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
  function estimateSize(value) {
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
  function hashText(text) {
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
  function randomToken(counter) {
    const part = () => Math.floor(Math.random() * 0x100000000).toString(36);
    return `${part()}${part()}${counter.toString(36)}`;
  }

  /**
   * Turns a name into a definition ID: lower case letters, digits and dashes.
   *
   * @param {string} name Name.
   * @returns {string} Slug, possibly empty.
   */
  function slugify(name) {
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
  function parseMarkers(raw) {
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
  function formatMarkers(markers) {
    return markers.map((m) => (m.count === null ? m.tag : `${m.tag}@${m.count}`)).join(',');
  }

  /**
   * Truncates text for logs and the dashboard.
   *
   * @param {*} text Text.
   * @param {number} [max=200] Maximum length.
   * @returns {string} Truncated text.
   */
  function truncate(text, max = 200) {
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
  function readPath(root, parts) {
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

  // The thin Roll20 boundary (plan §3). Every Roll20 global the engine uses is
  // reached through here, so the rest of the code reads as plain functions and
  // tests can run the bundle in a stub sandbox.

  /**
   * Returns the current epoch time. Roll20 has no monotonic clock.
   *
   * @returns {number} Epoch milliseconds.
   */
  function now() {
    return Date.now();
  }

  /**
   * Sets a timeout. Only the scheduler may call this.
   *
   * @param {Function} fn Callback.
   * @param {number} ms Delay.
   * @returns {*} Handle.
   */
  function setTimer(fn, ms) {
    return setTimeout(fn, ms);
  }

  /**
   * Clears a timeout. Only the scheduler may call this.
   *
   * @param {*} handle Handle.
   * @returns {void}
   */
  function clearTimer(handle) {
    clearTimeout(handle);
  }

  /**
   * Returns the persistent state root object.
   *
   * @returns {object} Roll20 `state`.
   */
  function stateRoot() {
    return state;
  }

  /**
   * Writes a line to the API console.
   *
   * @param {string} text Text.
   * @returns {void}
   */
  function logLine(text) {
    log(`${SCRIPT_NAME}: ${text}`);
  }

  /**
   * Returns a Roll20 object by type and ID, or null.
   *
   * @param {string} type Object type.
   * @param {string} id Object ID.
   * @returns {object|null} Object.
   */
  function getObject(type, id) {
    if (typeof id !== 'string' || !id) {
      return null;
    }
    return getObj(type, id) || null;
  }

  /**
   * Finds Roll20 objects.
   *
   * @param {object} filter findObjs filter.
   * @returns {object[]} Objects.
   */
  function findObjects(filter) {
    return findObjs(filter) || [];
  }

  /**
   * Creates a Roll20 object.
   *
   * @param {string} type Object type.
   * @param {object} attrs Attributes.
   * @returns {object|null} Object.
   */
  function createObject(type, attrs) {
    return createObj(type, attrs) || null;
  }

  /**
   * Returns the campaign object.
   *
   * @returns {object} Campaign.
   */
  function campaign() {
    return Campaign();
  }

  /**
   * Returns true when a sender is a real GM. API-origin messages (`playerid`
   * "API") are never GMs, whatever name they claim.
   *
   * @param {string} playerId Player ID from the message.
   * @returns {boolean} True for GMs.
   */
  function isGm(playerId) {
    if (typeof playerId !== 'string' || !playerId || playerId === 'API') {
      return false;
    }
    return Boolean(playerIsGM(playerId));
  }

  /**
   * Returns the IDs of every GM in the game.
   *
   * @returns {string[]} GM player IDs.
   */
  function gmPlayerIds() {
    return findObjects({ _type: 'player' })
      .filter((player) => isGm(player.id))
      .map((player) => player.id);
  }

  /**
   * Returns a player's display name.
   *
   * @param {string} playerId Player ID.
   * @returns {string} Name, or the ID.
   */
  function playerName(playerId) {
    return toText(getObject('player', playerId)?.get('displayname')) || toText(playerId);
  }

  /**
   * Sends a chat message.
   *
   * @param {string} speaker Speaker name.
   * @param {string} text Message text.
   * @param {object} [options] sendChat options.
   * @returns {void}
   */
  function chat(speaker, text, options) {
    sendChat(speaker, text, null, options);
  }

  /**
   * Pings a location.
   *
   * @param {number} left X.
   * @param {number} top Y.
   * @param {string} pageId Page ID.
   * @param {string|null} playerId Who pings (null for the Mod).
   * @param {boolean} moveAll Move everyone's view.
   * @param {string[]|undefined} visibleTo Player IDs who see it.
   * @returns {void}
   */
  function ping(left, top, pageId, playerId, moveAll, visibleTo) {
    sendPing(left, top, pageId, playerId, moveAll, visibleTo);
  }

  /**
   * Spawns a built-in or custom effect.
   *
   * @param {object} spec {left, top, pageId, fx, to?, definition?}.
   * @returns {void}
   */
  function spawnEffect(spec) {
    if (spec.definition) {
      spawnFxWithDefinition(spec.left, spec.top, spec.definition, spec.pageId);
    } else if (spec.to) {
      spawnFxBetweenPoints(
        { x: spec.left, y: spec.top },
        { x: spec.to.left, y: spec.to.top },
        spec.fx,
        spec.pageId
      );
    } else {
      spawnFx(spec.left, spec.top, spec.fx, spec.pageId);
    }
  }

  /**
   * Returns the Roll20 One-Click useroptions for this Mod.
   *
   * @param {string} key State key.
   * @returns {object|null} Options.
   */
  function userOptions(key) {
    if (typeof globalconfig === 'undefined' || !isRecord(globalconfig)) {
      return null;
    }
    const branch = globalconfig[key.toLowerCase()] || globalconfig[key];
    if (!isRecord(branch)) {
      return null;
    }
    return isRecord(branch.useroptions) ? branch.useroptions : branch;
  }

  /**
   * Registers a Roll20 event handler.
   *
   * @param {string} event Event name.
   * @param {Function} fn Handler.
   * @returns {void}
   */
  function onEvent(event, fn) {
    on(event, fn);
  }

  let jumpgateCache = null;

  /**
   * Returns true when the game runs on Jumpgate.
   *
   * @returns {boolean} True for Jumpgate games.
   */
  function isJumpgate() {
    if (jumpgateCache === null) {
      const c = campaign();
      jumpgateCache = toText(c.get('_release') || c.get('release')).toLowerCase() === 'jumpgate';
    }
    return jumpgateCache;
  }

  // A binary min-heap of scheduler jobs ordered by (dueAt, priority, sequence).
  // Pure: no Roll20 globals.

  /**
   * Returns true when job a must run before job b. Time always wins; priority
   * only orders equal deadlines; sequence keeps insertion order stable.
   *
   * @param {{dueAt: number, priority: number, sequence: number}} a Job.
   * @param {{dueAt: number, priority: number, sequence: number}} b Job.
   * @returns {boolean} True when a comes first.
   */
  function jobBefore(a, b) {
    if (a.dueAt !== b.dueAt) {
      return a.dueAt < b.dueAt;
    }
    if (a.priority !== b.priority) {
      return a.priority < b.priority;
    }
    return a.sequence < b.sequence;
  }

  /**
   * Creates an empty heap.
   *
   * @returns {{items: object[]}} Heap.
   */
  function createHeap() {
    return { items: [] };
  }

  /**
   * Inserts a job. O(log n).
   *
   * @param {{items: object[]}} heap Heap.
   * @param {object} job Job.
   * @returns {void}
   */
  function heapPush(heap, job) {
    const items = heap.items;
    items.push(job);
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!jobBefore(items[i], items[parent])) {
        break;
      }
      [items[i], items[parent]] = [items[parent], items[i]];
      i = parent;
    }
  }

  /**
   * Returns the first job without removing it. O(1).
   *
   * @param {{items: object[]}} heap Heap.
   * @returns {object|undefined} Head job.
   */
  function heapPeek(heap) {
    return heap.items[0];
  }

  /**
   * Removes and returns the first job. O(log n).
   *
   * @param {{items: object[]}} heap Heap.
   * @returns {object|undefined} Head job.
   */
  function heapPop(heap) {
    const items = heap.items;
    if (items.length === 0) {
      return undefined;
    }
    const head = items[0];
    const last = items.pop();
    if (items.length > 0) {
      items[0] = last;
      siftDown(items, 0);
    }
    return head;
  }

  /**
   * Rebuilds the heap from the given jobs. O(n).
   *
   * @param {{items: object[]}} heap Heap.
   * @param {object[]} jobs Jobs to keep.
   * @returns {void}
   */
  function heapRebuild(heap, jobs) {
    heap.items = [...jobs];
    for (let i = (heap.items.length >> 1) - 1; i >= 0; i -= 1) {
      siftDown(heap.items, i);
    }
  }

  /**
   * Moves an item down until both children come after it.
   *
   * @param {object[]} items Heap array.
   * @param {number} start Index.
   * @returns {void}
   */
  function siftDown(items, start) {
    let i = start;
    for (;;) {
      const left = 2 * i + 1;
      const right = left + 1;
      let first = i;
      if (left < items.length && jobBefore(items[left], items[first])) {
        first = left;
      }
      if (right < items.length && jobBefore(items[right], items[first])) {
        first = right;
      }
      if (first === i) {
        return;
      }
      [items[i], items[first]] = [items[first], items[i]];
      i = first;
    }
  }

  // The only owner of a timer in TaskAutomation (plan §3.1). One priority queue,
  // one re-armed timeout, generation guards and bounded draining. Pure: the
  // clock, timer functions and dispatcher are injected so tests can drive it.

  /**
   * Creates a scheduler.
   *
   * @param {object} options Options.
   * @param {() => number} options.now Epoch milliseconds.
   * @param {(fn: Function, ms: number) => *} options.setTimer setTimeout.
   * @param {(handle: *) => void} options.clearTimer clearTimeout.
   * @param {(job: object) => void} options.dispatch Runs one due job.
   * @param {(job: object, err: Error) => void} [options.onError] Called when a job throws.
   * @param {object} [options.limits] Budgets, see SCHEDULER_DEFAULTS.
   * @returns {object} Scheduler.
   */
  function createScheduler({ now, setTimer, clearTimer, dispatch, onError, limits = {} }) {
    const cfg = { ...SCHEDULER_DEFAULTS, ...limits };
    const heap = createHeap();
    const jobs = new Map();
    const keys = new Map();
    let sequence = 0;
    let nextJobId = 1;
    let handle = null;
    let armedDueAt = null;
    let armGeneration = 0;
    let draining = false;
    let lastWakeAt = null;
    let expectedWakeAt = null;
    const stats = {
      drains: 0,
      dispatched: 0,
      yields: 0,
      errors: 0,
      maxDrainMs: 0,
      clockJumps: 0,
      lastJumpMs: 0,
      compactions: 0,
      timersSet: 0,
    };

    /**
     * Returns the first job that has not been cancelled, discarding
     * cancelled jobs from the top of the heap.
     *
     * @returns {object|undefined} Head job.
     */
    function validHead() {
      let head = heapPeek(heap);
      while (head && jobs.get(head.id) !== head) {
        heapPop(heap);
        head = heapPeek(heap);
      }
      return head;
    }

    /**
     * Rebuilds the heap when cancelled jobs outnumber the configured ratio.
     *
     * @returns {void}
     */
    function maybeCompact() {
      const stale = heap.items.length - jobs.size;
      if (stale > cfg.compactMinimum && stale > heap.items.length * cfg.compactRatio) {
        heapRebuild(heap, [...jobs.values()]);
        stats.compactions += 1;
      }
    }

    /**
     * Arms the single timeout for the earliest job. Does nothing while
     * draining (the drain re-arms once at the end) or when the timer already
     * targets the same deadline.
     *
     * @param {number} [minDelay=0] Minimum delay, used to yield after a budget.
     * @returns {void}
     */
    function arm(minDelay = 0) {
      if (draining) {
        return;
      }
      const head = validHead();
      if (!head) {
        disarm();
        return;
      }
      const current = now();
      const target = Math.max(head.dueAt, current + minDelay);
      if (handle !== null && armedDueAt === target) {
        return;
      }
      disarm();
      armGeneration += 1;
      const generation = armGeneration;
      const delay = Math.min(Math.max(target - current, 0), cfg.maxHostDelayMs);
      armedDueAt = target;
      expectedWakeAt = current + delay;
      stats.timersSet += 1;
      handle = setTimer(() => wake(generation), delay);
    }

    /**
     * Clears the owned timeout, if any.
     *
     * @returns {void}
     */
    function disarm() {
      if (handle !== null) {
        clearTimer(handle);
      }
      handle = null;
      armedDueAt = null;
      expectedWakeAt = null;
    }

    /**
     * Notes clock jumps: a wake far from when it was expected means the clock
     * moved or the sandbox was suspended. The two cannot be told apart.
     *
     * @param {number} current Current time.
     * @returns {void}
     */
    function noteClock(current) {
      if (expectedWakeAt !== null) {
        const drift = current - expectedWakeAt;
        if (Math.abs(drift) > 5000) {
          stats.clockJumps += 1;
          stats.lastJumpMs = drift;
        }
      }
      lastWakeAt = current;
    }

    /**
     * Timer callback: runs due jobs within the job-count and time budgets.
     * Stale generations (callbacks queued before a clear) do nothing.
     *
     * @param {number} generation Arm generation captured when the timer was set.
     * @returns {void}
     */
    function wake(generation) {
      if (generation !== armGeneration || draining) {
        return;
      }
      handle = null;
      armedDueAt = null;
      const started = now();
      noteClock(started);
      expectedWakeAt = null;
      draining = true;
      let count = 0;
      let yieldNeeded = false;
      stats.drains += 1;
      try {
        for (;;) {
          const head = validHead();
          // A clamped long wait wakes early: never run future work.
          if (!head || head.dueAt > now()) {
            break;
          }
          if (count >= cfg.maxJobsPerDrain || now() - started >= cfg.maxDrainMs) {
            yieldNeeded = true;
            stats.yields += 1;
            break;
          }
          heapPop(heap);
          jobs.delete(head.id);
          if (head.key && keys.get(head.key) === head.id) {
            keys.delete(head.key);
          }
          count += 1;
          stats.dispatched += 1;
          try {
            dispatch(head);
          } catch (err) {
            stats.errors += 1;
            onError?.(head, err);
          }
        }
      } finally {
        draining = false;
        stats.maxDrainMs = Math.max(stats.maxDrainMs, now() - started);
        maybeCompact();
        arm(yieldNeeded ? cfg.yieldMs : 0);
      }
    }

    return {
      /**
       * Adds a job. A job with the same key replaces the earlier one.
       *
       * @param {{kind: string, dueAt: number, priority?: number, key?: string, target?: object}} spec Job.
       * @returns {number} Job ID.
       */
      add(spec) {
        if (!Number.isFinite(spec.dueAt)) {
          throw new Error(`Job ${spec.kind} has no finite deadline`);
        }
        if (spec.key) {
          this.cancelKey(spec.key);
        }
        const job = {
          id: nextJobId++,
          kind: spec.kind,
          dueAt: spec.dueAt,
          priority: spec.priority ?? JOB_PRIORITY[spec.kind] ?? 50,
          sequence: sequence++,
          key: spec.key || null,
          target: spec.target || {},
        };
        jobs.set(job.id, job);
        if (job.key) {
          keys.set(job.key, job.id);
        }
        heapPush(heap, job);
        const head = validHead();
        if (head === job || handle === null) {
          arm();
        }
        return job.id;
      },
      /**
       * Cancels a job by ID. The heap entry is discarded lazily.
       *
       * @param {number} jobId Job ID.
       * @returns {boolean} True when a job was cancelled.
       */
      cancel(jobId) {
        const job = jobs.get(jobId);
        if (!job) {
          return false;
        }
        const wasHead = heapPeek(heap) === job;
        jobs.delete(jobId);
        if (job.key && keys.get(job.key) === jobId) {
          keys.delete(job.key);
        }
        if (wasHead) {
          arm();
        }
        maybeCompact();
        return true;
      },
      /**
       * Cancels the job registered under a key.
       *
       * @param {string} key Key.
       * @returns {boolean} True when a job was cancelled.
       */
      cancelKey(key) {
        const id = keys.get(key);
        return id === undefined ? false : this.cancel(id);
      },
      /**
       * Cancels every job matching a predicate.
       *
       * @param {(job: object) => boolean} predicate Test.
       * @returns {number} Jobs cancelled.
       */
      cancelWhere(predicate) {
        let count = 0;
        for (const job of [...jobs.values()]) {
          if (predicate(job)) {
            this.cancel(job.id);
            count += 1;
          }
        }
        return count;
      },
      /**
       * Returns the job registered under a key.
       *
       * @param {string} key Key.
       * @returns {object|undefined} Job.
       */
      getKey(key) {
        const id = keys.get(key);
        return id === undefined ? undefined : jobs.get(id);
      },
      /**
       * Returns the earliest deadline, or null when idle.
       *
       * @returns {number|null} Epoch milliseconds.
       */
      nextDueAt() {
        return validHead()?.dueAt ?? null;
      },
      /**
       * Returns the number of live jobs.
       *
       * @returns {number} Count.
       */
      size() {
        return jobs.size;
      },
      /**
       * Returns live jobs, earliest first (for diagnostics).
       *
       * @param {number} [limit=20] Maximum jobs.
       * @returns {object[]} Jobs.
       */
      peekJobs(limit = 20) {
        return [...jobs.values()]
          .sort((a, b) => a.dueAt - b.dueAt || a.priority - b.priority || a.sequence - b.sequence)
          .slice(0, limit);
      },
      /**
       * Re-arms the timer, e.g. after the clock is known to have moved.
       *
       * @returns {void}
       */
      rearm() {
        disarm();
        arm();
      },
      /**
       * Drops every job and the timer (used when the Mod halts).
       *
       * @returns {void}
       */
      clear() {
        jobs.clear();
        keys.clear();
        heap.items = [];
        disarm();
      },
      /**
       * Returns counters for diagnostics.
       *
       * @returns {object} Stats.
       */
      stats() {
        return {
          ...stats,
          jobs: jobs.size,
          heap: heap.items.length,
          stale: heap.items.length - jobs.size,
          nextDueAt: validHead()?.dueAt ?? null,
          armed: handle !== null,
          armedDueAt,
          lastWakeAt,
        };
      },
    };
  }

  const TRANSLATION = {
    titles: {
      ready: 'TaskAutomation is ready.',
      help: 'TaskAutomation Commands',
      definitions: 'Task Definitions',
      validation: 'Validation',
      confirm: 'Please Confirm',
      export: 'Export ({page}/{pages})',
      templates: 'Templates',
      runs: 'Runs',
      dryRun: 'Dry Run',
      schedules: 'Schedules',
      schedulePreview: 'New Schedule',
      offset: 'Change UTC Offset',
      incidents: 'Missed Work',
      history: 'Finished Runs',
      audit: 'Audit Trail',
      diagnostics: 'Diagnostics',
      recovery: 'Recovery',
      config: 'Settings',
      adapters: 'Adapters',
    },
    menu: {
      status: 'Status',
      definitions: 'Tasks',
      active: 'Active runs',
      review: 'Need a decision',
      incidents: 'Open incidents',
    },
    buttons: {
      acknowledge: 'Acknowledge',
      add: 'Add',
      apply: 'Apply',
      archive: 'Archive',
      cancel: 'Cancel',
      clone: 'Clone',
      confirmPurge: 'Delete permanently',
      confirmRetry: 'Retry anyway',
      confirmSchedule: 'Create schedule',
      confirmStop: 'Stop everything',
      dashboard: 'Open Dashboard',
      definitions: 'Tasks',
      disable: 'Disable',
      dryRun: 'Dry run',
      enable: 'Enable',
      export: 'Export',
      help: 'Help',
      incidents: 'Missed work',
      inspect: 'Inspect',
      pause: 'Pause',
      publish: 'Publish',
      purge: 'Delete…',
      recoverRun: 'Run once…',
      recoverSkip: 'Skip…',
      refresh: 'Refresh',
      rerun: 'Run again',
      resume: 'Resume',
      resumeCatchUp: 'Resume and catch up',
      resumeSkip: 'Resume (skip paused times)',
      runs: 'Runs',
      show: 'Show',
      start: 'Start',
      templates: 'Templates',
      validate: 'Validate',
    },
    labels: {
      id: 'ID',
      revision: 'Revision',
      draft: 'unpublished changes',
      enabled: 'Enabled',
      yes: 'yes',
      triggers: 'Triggers',
      schedules: 'Schedules',
      steps: 'Steps',
      noSteps: 'No steps yet.',
      installed: '(installed)',
      definition: 'Task',
      status: 'Status',
      step: 'Step',
      started: 'Started',
      initiator: 'Started by',
      gmService: 'GM service',
      targets: 'Targets',
      lateness: 'Late by',
      journal: 'Actions',
      timeline: 'Timeline',
      ended: 'ended',
      schedule: 'Schedule',
      nextTimes: 'Next times (UTC)',
      before: 'Now',
      after: 'After',
      incident: 'Incident',
      cause: 'Cause',
      missed: 'Missed',
      range: 'Between',
    },
    statuses: {
      queued: 'queued',
      running: 'running',
      waiting: 'waiting',
      paused: 'paused',
      review: 'needs a decision',
      completed: 'completed',
      failed: 'failed',
      cancelled: 'cancelled',
      expired: 'expired',
    },
    incidentStatus: {
      open: 'open',
      acknowledged: 'acknowledged',
      resolved: 'resolved',
    },
    waits: {
      time: 'waiting for a time',
      event: 'waiting for {event}',
      child: 'waiting for {child}',
      join: 'waiting for branches',
      async: 'waiting for an adapter',
      retry: 'retrying soon',
      yield: 'about to continue',
      review: 'waiting for a decision',
    },
    review: {
      overdueWait: 'a wait ended long after it was due',
      uncertainOutcome: 'an action may or may not have happened',
      restartConflict: 'objects changed while the sandbox was off',
      restartPolicyReview: 'restarted (this task asks for a check after restarts)',
      controlLost: 'the player no longer controls a target',
      initiatorGone: 'the player who started it has left',
      publicationRevoked: 'the task is no longer published to players',
      adapterUnavailable: 'an adapter is not installed',
      stepError: 'a step failed',
    },
    decisions: {
      retry: 'Retry step',
      skip: 'Skip step',
      complete: 'Mark done and continue',
      skipNext: 'Skip the next step',
      cancel: 'Cancel run',
    },
    journal: {
      prepared: 'started',
      dispatched: 'sent (not confirmed)',
      confirmed: 'done',
      failed: 'failed',
      skipped: 'skipped',
      uncertain: 'outcome unknown',
      abandoned: 'abandoned',
    },
    timeline: {
      start: 'started ({trigger})',
      if: '{stepId}: chose {choice}',
      late: '{stepId}: ran late ({mode})',
      loopCap: '{stepId}: stopped at the loop limit',
      call: '{stepId}: started {child}',
      parallel: '{stepId}: started {branches} branches',
      event: '{stepId}: received {type}',
      awaitTimeout: '{stepId}: timed out waiting',
      asyncTimeout: '{stepId}: adapter did not answer',
      error: '{stepId}: {code} ({reason})',
      retry: '{stepId}: retry {attempt}',
      skip: '{stepId}: skipped after an error',
      join: '{stepId}: branches joined',
      childDone: '{stepId}: {child} {status}',
      pause: 'paused',
      resume: 'resumed',
      review: 'needs a decision ({reason})',
      decide: 'decision: {decision}',
      end: 'finished: {status}',
      observationGap: '{stepId}: events between restarts could not be seen',
    },
    causes: {
      late: 'Ran late',
      downtime: 'Sandbox was off',
      pause: 'Schedule was paused',
      concurrency: 'Already running',
      expiredQueue: 'Waited too long in the queue',
      queueFull: 'Queue was full',
      queueRejected: 'Could not start from the queue',
      burstCap: 'Too many events at once',
      bindingFailed: 'Targets not found',
      circuitBreaker: 'Started too often; task disabled',
      adapterUnavailable: 'Adapter not installed',
      observationGap: 'Events missed while the sandbox was off',
      overflow: 'Other missed work (combined)',
      overdueWait: 'A wait ended long after it was due',
      uncertainOutcome: 'Action outcome unknown',
      restartConflict: 'Objects changed while the sandbox was off',
      restartPolicyReview: 'Restarted',
      controlLost: 'Player lost control of a target',
      initiatorGone: 'Player left',
      publicationRevoked: 'Publication withdrawn',
      stepError: 'A step failed',
      rejected: 'Not started',
      tooManyRuns: 'Too many runs',
      halted: 'Everything was stopped',
      definitionDisabled: 'Task disabled',
    },
    dashboard: {
      generated: 'Generated {at} · v{version}',
      generatedNote:
        'This handout is rebuilt by the Mod. Anything you type here is overwritten. Times are UTC; remaining times are as of when it was generated.',
      statusRunning: 'Running',
      statusHalted: 'Stopped (stop-all)',
      statusDisabled: 'Disabled: state could not be loaded',
      refresh: 'Refresh',
      stopAll: 'Stop all…',
      resumeAll: 'Allow starts again',
      templates: 'Templates',
      help: 'Help',
      views: {
        overview: 'Overview',
        definitions: 'Tasks',
        instances: 'Runs',
        queue: 'Queue',
        incidents: 'Missed work',
        history: 'History',
        integrations: 'Integrations',
      },
      counts: {
        definitions: 'Tasks enabled',
        running: 'Running or waiting',
        paused: 'Paused',
        review: 'Need a decision',
        queued: 'Queued',
        incidents: 'Open incidents',
        nextJob: 'Next scheduled work',
      },
      cols: {
        item: 'Item',
        value: 'Value',
        schedule: 'Schedule',
        definition: 'Task',
        due: 'Due',
        state: 'State',
        triggers: 'Triggers',
        next: 'Next',
        run: 'Run',
        status: 'Status',
        targets: 'Targets',
        step: 'Step',
        entry: 'Entry',
        admitted: 'Queued at',
        expires: 'Expires',
        incident: 'Incident',
        cause: 'Cause',
        range: 'When',
        count: 'Count',
        finished: 'Finished',
        duration: 'Took',
        effects: 'Actions',
        adapter: 'Adapter',
        version: 'Version',
        actions: 'Actions',
        registered: 'Registered',
        task: 'Task',
        description: 'Description',
      },
      diag: {
        jobs: 'Scheduled jobs',
        stale: 'Cancelled jobs awaiting cleanup',
        next: 'Next job',
        armed: 'Timer set',
        drains: 'Timer wakes',
        yields: 'Budget yields',
        maxDrainMs: 'Longest wake (ms)',
        clockJumps: 'Clock jumps noticed',
        stateKb: 'Stored state (KiB)',
        boot: 'Started',
        admitted: 'Runs started',
        suppressed: 'Starts suppressed',
        dropped: 'Events dropped',
        coalesced: 'Events combined',
      },
      needsDecision: 'Needs a decision',
      nextTimes: 'Next scheduled times',
      warnings: 'Warnings',
      warnState: 'Stored state is {kb} KiB of a {max} KiB budget.',
      warnCircuit: 'Task {id} was disabled because it started too often.',
      warnDrift:
        'The dashboard became visible to players; it is not being updated. Run !taskautomation dashboard repair.',
      enabled: 'enabled',
      disabled: 'disabled ({reason})',
      noDefinitions: 'No tasks yet. Add one from Templates or with definition create.',
      noRuns: 'Nothing is running.',
      noQueue: 'The queue is empty.',
      noIncidents: 'No missed work.',
      noHistory: 'No finished runs yet.',
      noAdapters: 'No adapters registered.',
      noPlayerTasks: 'No tasks are shared with players.',
      late: 'late by {late}',
      uncertain: '{count} unknown',
      page: 'Page {page} of {pages}',
      prev: '‹ Previous',
      next: 'Next ›',
      diagnostics: 'Diagnostics',
      playerTitle: 'Tasks You Can Start',
      activeRuns: 'Running now',
    },
    messages: {
      readyHint:
        'Type !taskautomation for the menu, or open the TaskAutomation - Dashboard handout.',
      migrated: 'Stored data was upgraded from schema {from}.',
      recoverySummary:
        'After the restart: {runs} runs carried on, {review} need a decision, {missed} scheduled times were missed and {admitted} were run, {gaps} runs were waiting for events. The sandbox was off for about {gap}.',
      dashboardRefresh: 'The dashboard will refresh in a moment.',
      dashboardRepaired: 'The dashboard is GM-only again.',
      definitionCreated: 'Task {name} created ({id}). Add steps, then publish it.',
      valid: '{id} is valid.',
      invalid: '{id} has {count} problems:',
      published:
        '{id} revision {revision} published. New runs use it; running ones keep their revision.',
      enabled: '{id} enabled.',
      disabled: '{id} disabled. Runs already going carry on.',
      cloned: 'Copied as {name} ({id}).',
      archived: '{id} archived. It stays while anything refers to it.',
      purgePreview:
        'Delete {id} for good? Its {schedules} schedules are removed too. This cannot be undone.',
      purged: '{id} deleted.',
      exportedHandout:
        'Exported to the GM-only handout "{name}". Anyone you share that handout with can read it.',
      exportHint: 'Copy the text above into one line after {command} in any game.',
      imported: '{id} imported as revision {revision}.',
      importBegun:
        'Send the {parts} parts in order with definition import part --n <number> --json …',
      importPart: 'Part {n} of {parts} received.',
      importCancelled: 'Import cancelled.',
      draftUpdated: 'Draft of {id} updated. Validate and publish to use it.',
      templateAdded: 'Added: {ids}.',
      templateAddedDisabled:
        'Added: {ids}. It starts by itself, so it is disabled until you enable it.',
      started: '{id} started ({definition}).',
      queued: '{definition} is busy; the start was queued.',
      dryRunOk: '{id} would start: targets, permissions, branches and adapters check out.',
      dryRunNote: 'A dry run cannot predict future events, conditions or what other players do.',
      paused: '{id} paused.',
      resumed: '{id} resumed.',
      cancelled: '{id} cancelled. Actions already done ({effects}) are not undone.',
      decided: '{id}: {action}.',
      retryWarning: '{id} may already have done step {step}. Retrying could do it twice.',
      noSchedules: 'No schedules.',
      schedulePaused: '{id} paused. Its next time is kept.',
      scheduleResumed: '{id} resumed. Times passed while paused: {skipped}.',
      scheduleRemoved: '{id} removed.',
      nextTimes: '{id} next runs (UTC): {times}',
      offsetPreview: 'Move {id} to UTC{offset}?',
      offsetApplied: '{id} now uses UTC{offset}.',
      offsetNote:
        'Times use a fixed UTC offset. When the clocks change (for example British Summer Time), update it with schedule offset.',
      noFutureTimes: 'none',
      scheduleAdded: '{id} created. Next run {next} (UTC).',
      signalled: 'Signal {name} sent.',
      acknowledged: '{id} acknowledged. Nothing was run.',
      recoveryRunOnce:
        'One run will start now for the latest missed time. Older missed times are not run.',
      recoverySkip: 'The missed work will be marked as handled without running anything.',
      recovered: '{id} handled. Run: {run}.',
      configSet: '{key} is now {value}.',
      stopAllPreview:
        'Stop everything? {runs} runs are cancelled, {queued} queued starts are dropped and nothing new starts until you allow it. Messages and changes already made stay.',
      stopped: 'Stopped. Runs cancelled: {count}.',
      resumedAll: 'Tasks may start again.',
    },
    notices: {
      drift:
        'The TaskAutomation dashboard was shared with players. It will not be updated until you run !taskautomation dashboard repair.',
      adapterRegistered:
        'Adapter {name} is now installed. {count} runs were waiting for it in review.',
      disabled:
        'TaskAutomation could not load its saved data ({status}, schema {version}). No tasks will run and nothing was overwritten. Check the API console.',
      circuit: 'Task {id} started {count} times in a minute and was disabled.',
      review: 'Run {id} needs a decision: {reason} at {step}.',
      missed:
        'Schedule {id} missed {count} times while the sandbox was off. Choose what to do on the dashboard.',
    },
    errors: {
      internal: 'Something went wrong. The details are in the API console.',
      gmOnly: 'Only the GM can do that.',
      notAllowed: 'You are not allowed to do that.',
      rateLimited: 'Too many commands. Wait a minute and try again.',
      tooLarge: 'That is too large (limit {max} bytes).',
      modDisabled: 'TaskAutomation is disabled ({reason}). See the API console.',
      unterminatedQuote: 'A quote is not closed.',
      unknownCommand: 'Unknown command: {command}.',
      unknownOption: 'Unknown option {option}.',
      missingValue: '{option} needs a value.',
      badRev: '--rev must be a positive number.',
      badPair: 'Use name=value.',
      badView: 'Unknown section. Choose one of: {views}.',
      dashboardMissing: 'The dashboard handout could not be created.',
      definitionNotFound: 'There is no task {id}.',
      definitionExists: 'There is already a task {id}.',
      definitionDisabled: '{id} is disabled.',
      tooManyDefinitions: 'You already have the most tasks allowed ({max}).',
      badId: '"{id}" is not a valid ID (letters, digits, - and _; up to 48).',
      badName: 'Give a name of up to {max} characters.',
      badField: 'You can set: {fields}.',
      stale:
        '{id} has changed since that button was made. Refresh and try again (now revision {rev}).',
      nothingToPublish: '{id} has no draft to publish.',
      notPublished: '{id} has not been published yet.',
      invalidDefinition: 'That task is not valid.',
      purgeBlocked: 'It is still used: {runs} runs, {queued} queued, called by {callers}.',
      emptyJson: 'Add the JSON after --json.',
      badJson: 'That is not valid JSON.',
      tooDeep: 'That JSON is nested too deeply.',
      cycle: 'That JSON refers to itself.',
      notPlain: 'Only plain JSON values are allowed.',
      notFinite: 'Numbers must be finite.',
      unsafeKey: 'The key at {path} is not allowed.',
      stringTooLong: 'A text value is too long.',
      notObject: 'That must be a JSON object.',
      badParts: 'Parts must be between 1 and 64.',
      noImport: 'No import is in progress (or it expired).',
      importOrder: 'Send part {expected} next.',
      duplicateTrigger: 'There is already a trigger {id}.',
      triggerNotFound: 'There is no trigger {id}.',
      duplicateStep: 'There is already a step {id}.',
      stepNotFound: 'There is no step {id}.',
      badBlock: 'Cannot place the step there ({block}).',
      unknownAction: 'Unknown step type {type}.',
      templateNotFound: 'There is no template {id}.',
      runNotFound: 'There is no run {id} you can manage.',
      notPausable: '{id} cannot be paused while it is {status}.',
      notPaused: '{id} is not paused.',
      notActive: '{id} has already finished.',
      notInReview: '{id} is not waiting for a decision.',
      stillActive: '{id} is still running.',
      badDecision: 'Choose one of: {actions}.',
      alreadyRunning: '{id} is already running.',
      halted: 'Everything is stopped. Allow starts again first.',
      disabled: 'TaskAutomation is disabled.',
      revisionMissing: 'Revision {revision} of {id} is missing.',
      ancestryLimit: 'Too many tasks started each other (limit {max}).',
      recursionLimit: 'A task cannot call itself.',
      descendantLimit: 'This run started too many other runs (limit {max}).',
      tooManyRuns: 'Too many runs at once (limit {max}).',
      stateFull: 'Stored data is nearly full. Clear finished work first.',
      circuitOpen: '{id} started too often and was disabled.',
      concurrencyLimit: 'The most runs at once ({max}) are already going.',
      queueFull: 'The queue is full ({max}).',
      rejected: 'The task could not start.',
      apiDenied: 'Commands from other Mods cannot do that.',
      notShared: 'That task is not shared with you.',
      notController: 'You can only use tokens and characters you control.',
      tooManyTargets: 'Too many targets.',
      unknownBinding: "{name} is not one of this task's targets.",
      unknownParam: '{name} is not a parameter of this task.',
      paramRequired: 'The parameter {name} is required.',
      badParam: 'The parameter {name} is not valid ({reason}).',
      binding_selectionUnavailable: 'Select the targets for {binding} first.',
      binding_targetMissing: 'The target {id} for {binding} no longer exists.',
      binding_tooManyTargets: 'Too many targets for {binding} (at most {max}).',
      binding_noTargets: 'No targets for {binding}. Select some first.',
      scheduleNotFound: 'There is no schedule {id}.',
      scheduleKind: 'Give --at, --every, --daily or --weekly.',
      scheduleNeedsService:
        '{id} acts for a person. Set access.authority to gmService to schedule it.',
      badInstant: '"{value}" is not a date-time with an offset, e.g. 2026-11-01T19:00:00Z.',
      badOffset: 'Give the offset as +hh:mm or -hh:mm, e.g. +01:00.',
      offsetRequired: 'Daily and weekly schedules need --offset (the UTC offset, e.g. +00:00).',
      badMode: 'Choose one of: {modes}.',
      notCalendar: '{id} is not a daily or weekly schedule.',
      noFutureTimes: 'That schedule has no future times.',
      spec_badWindow: 'The start must be before the end.',
      spec_badCount: '--count must be a positive number.',
      spec_badTime: 'That time is not valid (use HH:MM).',
      spec_intervalTooShort: 'The interval must be at least {min}.',
      spec_badMode: 'The mode must be fixedRate or fixedDelay.',
      spec_badOffset: 'The offset is not valid.',
      spec_badDays: 'Give days as mon,tue,wed,thu,fri,sat,sun.',
      spec_badKind: 'Unknown schedule kind.',
      signalNotAllowed: 'You cannot send the signal {name}.',
      incidentNotFound: 'There is no open incident {id}.',
      recoveryRejected: 'The recovery run could not start ({reason}).',
      confirmationUnknown: 'That confirmation is not valid. Preview again.',
      confirmationExpired: 'That confirmation expired. Preview again.',
      confirmationForeign: 'That confirmation was made for someone else.',
      notHalted: 'Nothing is stopped.',
      badConfig: 'Unknown setting or value for {key}.',
      gmOnlyMode: 'Only the GM can do that.',
    },
    hints: {
      gmOnly: 'Ask your GM to share the task with you.',
      unknownCommand: 'Type !taskautomation help for the commands.',
      unknownOption: 'Type !taskautomation help for the commands.',
      stale: 'Click Refresh on the dashboard, or open the run again.',
      binding_selectionUnavailable:
        'Scheduled and event starts need explicit IDs: --bind name=-id1,-id2.',
    },
    validation: {
      unknownField: '{field} is not a known field.',
      schemaVersion: 'schemaVersion must be {version}.',
      badId: '"{id}" is not a valid ID.',
      badName: 'Give a name of up to {max} characters.',
      duplicateId: '"{id}" is used twice.',
      notObject: 'must be an object.',
      notArray: 'must be a list.',
      notString: 'must be text.',
      notNumber: 'must be a number.',
      notBoolean: 'must be true or false.',
      notFinite: 'must be a finite number.',
      notIdList: 'must be a list of IDs.',
      badEnum: 'must be one of: {values}.',
      outOfRange: 'must be between {min} and {max}.',
      stringTooLong: 'is longer than {max} characters.',
      missingField: '{field} is required.',
      noSteps: 'add at least one step.',
      tooManySteps: 'more than {max} steps.',
      tooDeep: 'nested more than {max} levels.',
      unknownAction: '{type} is not a step type.',
      unknownParam: 'there is no parameter {name}.',
      unknownBinding: 'there is no target binding {name}.',
      badTarget: 'use {"binding": name}, {"ids": [...]} or {"ref": path}.',
      badTemplate: 'must be text of up to {max} characters.',
      badProperty: '{property} cannot be used here.',
      badInstant: 'needs a date-time with an offset, e.g. 2026-11-01T19:00:00Z.',
      badClock: 'needs a time as HH:MM.',
      badOffset: 'needs an offset as +hh:mm.',
      badDays: 'needs days such as ["mon","fri"].',
      intervalTooShort: 'must be at least {min} ms.',
      badCrossing: 'needs property, direction (below or above) and a numeric threshold.',
      badMatch: 'needs equals, contains or startsWith.',
      badBurst: 'needs count and windowMs.',
      badMerge: 'needs name and a reducer (sum, min, max, first, last, count, all, any).',
      badCommand: 'must start with a Mod command such as !token-mod and be one line.',
      waitKind: 'give either durationMs or until.',
      waitTooShort: 'waits must be at least {min} ms.',
      foreverNotAllowed: 'set policy.allowForever to true to allow a loop that never ends.',
      foreverNoWait: 'a forever loop must wait on every pass.',
      branchCount: 'parallel needs 2 to {max} branches.',
      gmOnlyAction: '{type} cannot be shared with players.',
      notPlayerCapability: '{type} is not allowed in a task shared with players.',
      playersNeedInitiator:
        'tasks shared with players must act as the player (authority initiator).',
      unattendedNeedsService: 'scheduled and event tasks must use authority gmService.',
      selectionUnattended:
        'selection only exists when someone starts the task; add an alternate binding.',
      callCycle: 'tasks call each other in a circle: {cycle}.',
      lateBoundDefinition: 'calls {id}, which does not exist yet.',
      adapterUnknown: 'uses adapter {adapter}, which is not installed.',
      badRef: '"{ref}" is not a valid reference.',
      refRoot: '{root} is not available here (use {allowed}).',
      badConversion: '"{as}" is not number, string or boolean.',
      defaultScalar: 'the default must be a single value.',
      badOperator: '"{op}" is not an operator.',
      missingOperand: '{op} needs {field}.',
      arity: '{op} needs {count} arguments.',
      exprShape: 'is not an expression.',
      exprTooDeep: 'the expression is nested more than {max} levels.',
      exprTooLarge: 'the expression has more than {max} parts.',
    },
    runErrors: {
      internal: 'Internal error: {message}',
      cancelled: 'Cancelled.',
      replaced: 'Replaced by a newer run.',
      parentFinished: 'The run that started it finished.',
      stopAll: 'Stopped by stop-all.',
      cancelledByTask: 'Cancelled by another task.',
      branchCancelled: 'Its branch was cancelled.',
      reviewCancelled: 'Cancelled after review.',
      stopStep: 'Stopped by a stop step: {message}',
      runTimeout: 'Took longer than its time limit.',
      runExpired: 'Its lifetime ended.',
      overdueExpired: 'Too late to be useful (late by {latenessMs} ms).',
      runaway: 'Ran {max} steps without waiting; stopped to protect the game.',
      revisionMissing: 'Its task revision is missing.',
      restartPolicyFail: 'Stopped by a restart (this task fails on restart).',
      noTargets: 'No targets left for this step.',
      noCharacter: '{name} does not represent a character.',
      noRecipients: 'Nobody to send the message to.',
      attributeMissing: '{name} has no attribute {attribute}.',
      notNumeric: '{attribute} is not a number.',
      notNumber: '{field} is not a number.',
      badValue: '{field} has a value that cannot be used.',
      valueMissing: '{field} has no value.',
      expectedValue: '{property} of {name} has changed; nothing was overwritten.',
      notMultiSided: '{name} is not a multi-sided token.',
      sideOutOfRange: '{name} has only {max} sides.',
      sideImageUnsupported:
        'Side {side} of {name} is not an image the API can set (it must be in your library).',
      badMarker: '{marker} is not a valid marker name.',
      trackMissing: 'There is no jukebox track {track}.',
      fxMissing: 'There is no custom effect {fx}.',
      customFx: 'Custom effects need the GM.',
      badLocation: 'The location is not valid.',
      gmOnlyAction: '{type} needs the GM.',
      gmOnlyMode: '{mode} needs the GM.',
      gmProperty: 'Only the GM can change {property}.',
      emptyMessage: 'The message is empty.',
      badCommand: 'The command is not valid.',
      unsafeArgument: 'A value cannot be put into the command safely.',
      rateLimited: 'Too many {what} (limit {max} a minute).',
      adapterUnavailable: 'Adapter {adapter} is not installed.',
      adapterAction: 'Adapter {adapter} has no action {action}.',
      adapterAuthority: 'Adapter {adapter} needs the GM.',
      adapterFailed: 'Adapter {adapter} reported a failure: {message}',
      workerUnavailable: 'Sheet workers cannot be used in this game.',
      definitionMissing: 'Task {id} does not exist.',
      childRejected: 'Could not start {id} ({reason}).',
      childFailed: '{child} {status}.',
      detachNeedsGm: 'Only GM runs may start runs that carry on alone.',
      runNotOwned: '{id} does not belong to this run.',
      tooManyBranches: 'More than {max} branches.',
      allBranchesFailed: 'Every branch failed.',
      branchFailed: 'A branch failed.',
      badDuration: 'The wait is not a valid duration.',
      badInstant: 'The time is not valid.',
      badCount: 'The loop count is not a whole number.',
      unknownAction: 'Unknown step type {type}.',
      controlLost: 'The player no longer controls {name}.',
      initiatorGone: 'The player who started it has left.',
      publicationRevoked: 'The task is no longer shared with players.',
    },
    help: {
      menu: 'Show the menu.',
      help: 'Show these commands.',
      dashboard: 'Open, refresh or page the GM dashboard handout.',
      definition: 'List, show, create, validate and publish tasks.',
      definitionManage: 'Enable, disable, copy, archive or delete tasks.',
      definitionEdit:
        'Edit a draft: name, parameters, targets, access, policy, triggers and steps.',
      definitionTransfer: 'Copy tasks between games as JSON.',
      template: 'List or add the worked examples.',
      instanceStart:
        'Start a task (selected tokens become its targets), or check it with a dry run.',
      instance: 'List, inspect, pause, resume, cancel or rerun runs.',
      instanceDecide: 'Decide what a run that needs a decision does next.',
      schedule: 'Run tasks at a time, every so often, daily or weekly.',
      signal: 'Send a named signal to waiting tasks.',
      report: 'Missed work, finished runs, the audit trail and diagnostics.',
      recovery: 'Preview and apply recovery for missed work.',
      config: 'Show or change settings.',
      adapter: 'List Mod adapters.',
      stopAll: 'Emergency stop: cancel all runs and hold new ones.',
      resumeAll: 'Allow tasks to start again after stop-all.',
    },
    stepTypes: {
      wait: 'Wait for a duration (durationMs) or until a moment (until).',
      awaitEvent: 'Wait for an event or signal, with a timeout.',
      if: 'Run then or else depending on a condition.',
      loop: 'Repeat steps: count, while, until or forever (GM-approved).',
      call: 'Run another task; wait for it unless await is false.',
      parallel: 'Run branches side by side; join all, anySuccess or race.',
      stop: 'Finish the run now.',
      'variable.set': 'Store a value for later steps.',
      'event.emit': 'Send a named signal to other tasks.',
      'chat.send': 'Say, emote, describe or whisper a message.',
      'chat.command': 'GM only: send a chat command such as /roll.',
      'token.set': 'Set token position, rotation, layer, bars, tint or name.',
      'token.get': 'Read a token property into a variable.',
      'token.advanceSide': 'Move a multi-sided token to its next side.',
      'token.setSide': 'Show a chosen side of a multi-sided token.',
      'attribute.set': 'Set a character attribute.',
      'attribute.adjust': 'Add to or subtract from a numeric attribute.',
      'attribute.get': 'Read an attribute into a variable.',
      'marker.set': 'Add, remove, toggle or count a status marker.',
      ping: 'Ping a token or a point.',
      'effect.spawn': 'Show a visual effect.',
      'audio.control': 'Play, stop or change the volume of a jukebox track.',
      'task.start': 'Start another task that carries on by itself.',
      'task.cancel': 'Cancel runs this run started.',
      'task.pause': 'Pause runs this run started.',
      'integration.command': 'GM only: send an approved command to another Mod.',
      'integration.call': 'Call a trusted Mod adapter and wait for its answer.',
    },
    triggerTypes: {
      manual: 'Started from a command, button or the dashboard.',
      at: 'Once, at a date-time with an offset.',
      interval: 'Every so often (fixed rate or fixed delay).',
      daily: 'Every day at a time, at a fixed UTC offset.',
      weekly: 'On chosen days at a time, at a fixed UTC offset.',
      event: 'When tokens, attributes, the turn order, the page, players or tasks change.',
      signal: 'When someone sends !taskautomation signal <name>.',
      chat: 'When ordinary chat matches (GM-approved).',
    },
    overdueModes: {
      skip: 'Skip what was missed and note it.',
      runOnce: 'Run once for the latest missed time.',
      catchUpBounded: 'Run a few of the missed times, spaced out.',
      review: 'Ask the GM.',
      expire: 'Drop it: it is too late to matter.',
    },
    handout: {
      subtitle: 'Version {version} · GM only',
      intro:
        'TaskAutomation runs tasks you describe as data: steps such as messages, token and attribute changes, waits, conditions, loops and parallel branches, started by hand, on a schedule or by events in the game.',
      quickStart: {
        heading: 'Quick Start',
        items: [
          'Open the TaskAutomation - Dashboard handout, or type !taskautomation.',
          'Click Templates and add one of the worked examples.',
          'Select any tokens it needs and click Start.',
          'Watch it on the dashboard; pause, resume or cancel it there.',
        ],
      },
      concepts: {
        heading: 'How It Works',
        items: [
          'A task (definition) is a program. Publishing it makes a numbered revision; runs keep the revision they started with.',
          'A run is one start of a task, with its own targets, variables and progress.',
          'All waiting uses one timer. Waits are saved, so runs carry on after an API restart.',
          "If the sandbox was off, missed times are reported and handled by the task's overdue policy.",
          'Actions that may have happened when the sandbox stopped are never repeated automatically: the run asks you.',
          'Tasks are GM-only unless published to players, who can then only start them on things they control.',
        ],
      },
      commands: { heading: 'Commands', command: 'Command', does: 'What it does' },
      steps: { heading: 'Step Types', type: 'Type', does: 'What it does' },
      triggers: { heading: 'Triggers', type: 'Type', does: 'Starts the task' },
      overdue: {
        heading: 'Missed Work',
        intro:
          'A short delay (250 ms by default) is normal. Up to five minutes late, a schedule runs once. Beyond that the overdue mode decides:',
        mode: 'Mode',
        does: 'What happens',
      },
      limits: {
        heading: 'Good to Know',
        items: [
          'Times are real-world time, not game time. Schedules use a fixed UTC offset; update it when the clocks change.',
          'Nothing runs while the API sandbox is off, and events that happened then cannot be seen.',
          'Changes to several objects are not all-or-nothing. A cancelled run does not undo what it already did.',
          'A command sent to another Mod is shown as sent, not as done.',
          'The dashboard is a snapshot. Click Refresh to update it; it never ticks by itself.',
        ],
      },
      footer: 'TaskAutomation by {name}',
    },
  };

  const DEFAULT_LOCALE = 'en-US';

  // Add a locale here, create src/locales/locale/<code>.js (copy en-US.js) and
  // import it in index.js, then run `npm run sync-locales` to translate it.
  const LOCALE_DEFINITIONS = Object.freeze([
    {
      code: 'en-US',
      name: 'English (US)',
      direction: 'ltr',
      translationFile: 'locale/en-US.js',
      aliases: ['en'],
      flag: '🇺🇸',
      flagLabel: 'Flag of the United States',
    },
  ]);

  const SUPPORTED_LOCALES = Object.freeze(LOCALE_DEFINITIONS.map(({ code }) => code));
  const VALID_LOCALES = new Set(SUPPORTED_LOCALES);
  const LOCALE_ALIASES = Object.freeze(
    LOCALE_DEFINITIONS.reduce((aliases, locale) => {
      for (const alias of locale.aliases || []) {
        aliases[alias] = locale.code;
      }
      return aliases;
    }, {})
  );
  const LOCALE_LABELS = Object.freeze(
    LOCALE_DEFINITIONS.reduce((labels, locale) => {
      const displayName = locale.nativeName
        ? `${locale.code} - ${locale.name} (${locale.nativeName})`
        : `${locale.code} - ${locale.name}`;
      labels[locale.code] = displayName;
      return labels;
    }, {})
  );
  SUPPORTED_LOCALES.map((code) => LOCALE_LABELS[code]).join(' / ');

  const TRANSLATIONS = {
    'en-US': TRANSLATION,
  };

  /**
   * Returns the canonical locale for a supported locale string or alias.
   * Matching is case-insensitive after exact matches are checked.
   *
   * @param {string} lang Locale string or alias (e.g. 'en', 'fr', 'zh-TW').
   * @returns {string} Canonical locale code, or an empty string when unsupported.
   */
  function normalizeLocale(lang) {
    const s = typeof lang === 'string' ? lang.trim() : '';
    if (VALID_LOCALES.has(s)) {
      return s;
    }
    if (LOCALE_ALIASES[s]) {
      return LOCALE_ALIASES[s];
    }
    const normalized = s.toLowerCase();
    const found = Array.from(VALID_LOCALES).find((locale) => locale.toLowerCase() === normalized);
    return (
      found ||
      Object.entries(LOCALE_ALIASES).find(([alias]) => alias.toLowerCase() === normalized)?.[1] ||
      ''
    );
  }

  /**
   * Returns a valid canonical locale, falling back to the default when unsupported.
   *
   * @param {string} lang Locale string to validate.
   * @returns {string} Validated canonical locale.
   */
  function getLocale(lang) {
    return normalizeLocale(lang) || DEFAULT_LOCALE;
  }

  /**
   * Navigates a nested object following dot-separated key path segments.
   *
   * @param {object} obj Root object.
   * @param {string[]} parts Key path segments.
   * @returns {*} Value at the path, or undefined.
   */
  function getNestedValue(obj, parts) {
    let current = obj;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }
    return current;
  }

  /**
   * Returns the raw translated value (string, array or object) for a key,
   * falling back to en-US when the key is missing in the requested locale.
   *
   * @param {string} key Dot-separated translation key.
   * @param {string} locale Locale code.
   * @returns {*} Raw value, or undefined when not found.
   */
  function tRaw(key, locale) {
    const lang = getLocale(locale);
    const parts = key.split('.');
    const value = getNestedValue(TRANSLATIONS[lang], parts);
    return value === undefined && lang !== DEFAULT_LOCALE
      ? getNestedValue(TRANSLATIONS[DEFAULT_LOCALE], parts)
      : value;
  }

  /**
   * Returns the text direction CSS for a locale.
   *
   * @param {string} locale Locale code.
   * @returns {string} CSS declarations, empty for left-to-right locales.
   */
  function getDirectionStyle(locale) {
    const lang = getLocale(locale);
    const def = LOCALE_DEFINITIONS.find((d) => d.code === lang);
    return def?.direction === 'rtl' ? 'direction:rtl;text-align:right;' : '';
  }

  /**
   * Returns the translated string for a dot-separated key, interpolating {placeholder} vars.
   * Falls back to en-US when the key is missing in the requested locale.
   * No HTML escaping is performed — callers must pre-escape HTML-unsafe values.
   *
   * @param {string} key Dot-separated translation key (e.g. 'errors.noTokensSelected').
   * @param {string} locale Locale code.
   * @param {object} [vars] Interpolation variables mapped to {placeholder} names.
   * @returns {string} Translated and interpolated string. Returns the key when not found.
   */
  function t(key, locale, vars = {}) {
    const lang = getLocale(locale);
    const parts = key.split('.');
    let value = getNestedValue(TRANSLATIONS[lang], parts);

    if (value === undefined && lang !== DEFAULT_LOCALE) {
      value = getNestedValue(TRANSLATIONS[DEFAULT_LOCALE], parts);
    }

    if (typeof value !== 'string') {
      return key;
    }

    return value.replaceAll(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
  }

  // Persistent state (plan §3.2): namespaced JSON under state.TaskAutomation,
  // sequential migrations with a bounded backup, ID counters, configuration
  // and size estimates. Live objects, timers and indexes never go in here.

  const BACKUP_KEY = `${STATE_KEY}Backup`;
  const MAX_BACKUP_BYTES = 256 * 1024;

  // Map branches every valid state must have, with their empty values.
  const BRANCHES = {
    definitions: () => ({}),
    schedules: () => ({}),
    triggerState: () => ({}),
    instances: () => ({}),
    queues: () => ({}),
    incidents: () => ({}),
    history: () => [],
    audit: () => [],
    confirmations: () => ({}),
    imports: () => ({}),
    circuit: () => ({}),
    baselines: () => ({}),
    notices: () => ({}),
  };

  // Sequential migrations: MIGRATIONS[n] turns schema n into schema n + 1.
  // Schema 1 is the first release, so there are none yet; the loop and its
  // backup/rollback are exercised by tests with a synthetic migration.
  const MIGRATIONS = {};

  /**
   * Returns a fresh state.
   *
   * @param {number} at Creation time.
   * @returns {object} State.
   */
  function createState(at) {
    const fresh = {
      schemaVersion: SCHEMA_VERSION,
      releaseVersion: SCRIPT_VERSION,
      createdAt: at,
      boot: { id: null, at: null, count: 0, lastObservedAt: null },
      config: { ...DEFAULT_CONFIG },
      counters: { id: 1, token: 1 },
      halted: null,
      dashboard: {
        handoutId: null,
        playerHandoutId: null,
        helpHandoutId: null,
        view: 'overview',
        page: 1,
        lastHash: null,
        playerHash: null,
        recreatedAt: 0,
        drift: null,
      },
      stats: {
        admitted: 0,
        rejected: 0,
        suppressed: 0,
        dropped: 0,
        coalesced: 0,
        completed: 0,
        failed: 0,
      },
    };
    for (const [key, make] of Object.entries(BRANCHES)) {
      fresh[key] = make();
    }
    return fresh;
  }

  /**
   * Checks the shape of stored state without changing it.
   *
   * @param {*} raw Stored value.
   * @returns {{ok: boolean, error?: string}} Result.
   */
  function checkStateShape(raw) {
    if (!isRecord(raw)) {
      return { ok: false, error: 'notObject' };
    }
    if (!Number.isInteger(raw.schemaVersion) || raw.schemaVersion < 1) {
      return { ok: false, error: 'badSchemaVersion' };
    }
    for (const [key, make] of Object.entries(BRANCHES)) {
      if (raw[key] !== undefined && Array.isArray(make()) !== Array.isArray(raw[key])) {
        return { ok: false, error: `bad:${key}` };
      }
      if (raw[key] !== undefined && !Array.isArray(raw[key]) && !isRecord(raw[key])) {
        return { ok: false, error: `bad:${key}` };
      }
    }
    return { ok: true };
  }

  /**
   * Fills in branches added since the state was written, keeping data.
   *
   * @param {object} s State.
   * @param {number} at Current time.
   * @returns {object} The same state.
   */
  function fillDefaults(s, at) {
    const fresh = createState(at);
    for (const key of Object.keys(fresh)) {
      if (s[key] === undefined) {
        s[key] = fresh[key];
      }
    }
    s.config = { ...DEFAULT_CONFIG, ...(isRecord(s.config) ? s.config : {}) };
    s.dashboard = { ...fresh.dashboard, ...(isRecord(s.dashboard) ? s.dashboard : {}) };
    s.stats = { ...fresh.stats, ...(isRecord(s.stats) ? s.stats : {}) };
    s.counters = { ...fresh.counters, ...(isRecord(s.counters) ? s.counters : {}) };
    return s;
  }

  /**
   * Migrates stored state in place to the current schema. Never overwrites
   * state from a newer version or state that is not recognisable: the Mod
   * stops instead and tells the GM.
   *
   * @param {*} raw Stored value (undefined on a new game).
   * @param {number} at Current time.
   * @param {object} [migrations] Migration table (tests pass their own).
   * @param {number} [target] Schema to migrate to (tests pass their own).
   * @returns {{status: 'fresh'|'ok'|'migrated'|'newer'|'corrupt'|'migrationFailed', state?: object, from?: number, error?: string}}
   *          Outcome.
   */
  function migrateState(raw, at, migrations = MIGRATIONS, target = SCHEMA_VERSION) {
    if (raw === undefined || raw === null) {
      return { status: 'fresh', state: createState(at) };
    }
    const shape = checkStateShape(raw);
    if (!shape.ok) {
      return { status: 'corrupt', error: shape.error };
    }
    if (raw.schemaVersion > target) {
      return { status: 'newer', from: raw.schemaVersion };
    }
    if (raw.schemaVersion === target) {
      return { status: 'ok', state: fillDefaults(raw, at) };
    }
    const from = raw.schemaVersion;
    let working = clone(raw);
    try {
      while (working.schemaVersion < target) {
        const step = migrations[working.schemaVersion];
        if (typeof step !== 'function') {
          return { status: 'migrationFailed', from, error: `noMigration:${working.schemaVersion}` };
        }
        working = step(working);
        const check = checkStateShape(working);
        if (!check.ok) {
          return { status: 'migrationFailed', from, error: check.error };
        }
      }
    } catch (err) {
      return { status: 'migrationFailed', from, error: String(err?.message || err) };
    }
    return { status: 'migrated', from, state: fillDefaults(working, at) };
  }

  /**
   * Loads, validates and migrates the persistent state. On failure the
   * original data is left untouched and the Mod runs no tasks.
   *
   * @param {number} at Current time.
   * @returns {{status: string, from?: number, error?: string}} Outcome.
   */
  function initialiseState(at) {
    const root = stateRoot();
    const raw = root[STATE_KEY];
    let backupMade = false;
    if (
      isRecord(raw) &&
      Number.isInteger(raw.schemaVersion) &&
      raw.schemaVersion < SCHEMA_VERSION
    ) {
      if (estimateSize(raw) <= MAX_BACKUP_BYTES) {
        root[BACKUP_KEY] = clone(raw);
        backupMade = true;
      }
    }
    const result = migrateState(raw, at);
    if (!result.state) {
      return result;
    }
    result.state.releaseVersion = SCRIPT_VERSION;
    root[STATE_KEY] = result.state;
    if (backupMade) {
      delete root[BACKUP_KEY];
    }
    return result;
  }

  /**
   * Returns the persistent state.
   *
   * @returns {object} State branch.
   */
  function getState() {
    return stateRoot()[STATE_KEY];
  }

  /**
   * Returns the global configuration.
   *
   * @returns {object} Config.
   */
  function getConfig() {
    return getState().config;
  }

  /**
   * Returns the effective limits. Limits are product defaults; they live in
   * code so a crafted import cannot raise them.
   *
   * @returns {object} Limits.
   */
  function getLimits() {
    return DEFAULT_LIMITS;
  }

  /**
   * Allocates a new ID with a prefix, e.g. `run-42`.
   *
   * @param {string} prefix Prefix.
   * @returns {string} ID.
   */
  function nextId(prefix) {
    const s = getState();
    const id = `${prefix}-${s.counters.id}`;
    s.counters.id += 1;
    return id;
  }

  /**
   * Returns the next value of the confirmation-token counter.
   *
   * @returns {number} Counter.
   */
  function nextTokenCounter() {
    const s = getState();
    s.counters.token += 1;
    return s.counters.token;
  }

  /**
   * Validates a configuration value.
   *
   * @param {string} key Config key.
   * @param {*} raw Raw value.
   * @returns {{valid: boolean, value?: *}} Result.
   */
  function validateConfigValue(key, raw) {
    switch (key) {
      case 'language': {
        const value = normalizeLocale(String(raw ?? ''));
        return value ? { valid: true, value } : { valid: false };
      }
      case 'dashboardRows': {
        const value = parseStrictInt(raw);
        return DASHBOARD_ROW_OPTIONS.includes(value) ? { valid: true, value } : { valid: false };
      }
      case 'playerView':
      case 'diagnostics':
      case 'privateChatTriggers': {
        const value = parseBoolean(raw);
        return value === null ? { valid: false } : { valid: true, value };
      }
      case 'roundAnchor': {
        const value = String(raw ?? '').trim();
        return value && value.length <= 40 ? { valid: true, value } : { valid: false };
      }
      case 'checkpointMs': {
        if (String(raw) === '0' || String(raw).toLowerCase() === 'off') {
          return { valid: true, value: 0 };
        }
        const value = typeof raw === 'number' ? raw : parseDuration(raw);
        return value !== null && value >= 60000 ? { valid: true, value } : { valid: false };
      }
      case 'graceMs':
      case 'lateWindowMs': {
        const value = typeof raw === 'number' ? raw : parseDuration(raw);
        const min = key === 'graceMs' ? 0 : 1000;
        return value !== null && value >= min ? { valid: true, value } : { valid: false };
      }
      default:
        return { valid: false };
    }
  }

  /**
   * Sets one configuration value.
   *
   * @param {string} key Config key.
   * @param {*} raw Raw value.
   * @returns {{valid: boolean, value?: *}} Result.
   */
  function setConfigValue(key, raw) {
    if (!(key in DEFAULT_CONFIG)) {
      return { valid: false };
    }
    const result = validateConfigValue(key, raw);
    if (result.valid) {
      getConfig()[key] = result.value;
    }
    return result;
  }

  /**
   * Imports One-Click useroptions. Options are only re-applied when the GM
   * changes them on the Mod page, so chat changes survive restarts.
   *
   * @returns {void}
   */
  function applyGlobalConfig() {
    const options = userOptions(STATE_KEY);
    if (!options) {
      return;
    }
    const s = getState();
    const applied = isRecord(s.notices.useroptions) ? s.notices.useroptions : {};
    for (const key of USEROPTION_KEYS) {
      if (key in options && options[key] !== applied[key]) {
        setConfigValue(key, options[key]);
        applied[key] = options[key];
      }
    }
    s.notices.useroptions = applied;
  }

  /**
   * Estimates the stored size of the state.
   *
   * @returns {number} Approximate bytes.
   */
  function stateSize() {
    return estimateSize(getState());
  }

  let sizeCache = { at: -Infinity, bytes: 0 };

  /**
   * Returns true when the state is close to its size budget; new admissions
   * are refused while history and incidents keep their headroom. The size is
   * re-measured at most every ten seconds.
   *
   * @param {number} at Current time.
   * @returns {boolean} True when nearly full.
   */
  function stateNearlyFull(at) {
    if (at - sizeCache.at > 10000) {
      sizeCache = { at, bytes: stateSize() };
    }
    return sizeCache.bytes > getLimits().stateBytes * 0.9;
  }

  // In-memory runtime shared by the services: the one scheduler, job handlers,
  // cross-service hooks and the admission gate. Nothing here is persisted; the
  // scheduler is rebuilt from persistent records on every start (plan §3.1).

  const handlers = new Map();
  const hooks = new Map();

  const runtime = {
    ready: false,
    // True while startup recovery runs; triggers and starts wait.
    admissionsHeld: true,
    // Set when state could not be loaded; nothing runs.
    disabled: null,
    bootId: null,
    bootAt: null,
    scheduler: null,
  };

  /**
   * Creates the scheduler. Each job kind is dispatched to the handler
   * registered with `onJob`.
   *
   * @returns {object} Scheduler.
   */
  function createRuntimeScheduler() {
    runtime.scheduler = createScheduler({
      now,
      setTimer,
      clearTimer,
      dispatch(job) {
        const handler = handlers.get(job.kind);
        if (handler) {
          handler(job);
        }
        const s = getState();
        if (s) {
          s.boot.lastObservedAt = now();
        }
      },
      onError(job, err) {
        logLine(`ERROR in ${job.kind} job: ${err?.message || err}`);
        if (err?.stack) {
          log(err.stack);
        }
      },
    });
    return runtime.scheduler;
  }

  /**
   * Registers the handler for a job kind.
   *
   * @param {string} kind Job kind.
   * @param {(job: object) => void} fn Handler.
   * @returns {void}
   */
  function onJob(kind, fn) {
    handlers.set(kind, fn);
  }

  /**
   * Schedules a job on the shared scheduler.
   *
   * @param {object} spec Job spec (kind, dueAt, key, target).
   * @returns {number|null} Job ID, or null when the scheduler is not running.
   */
  function schedule(spec) {
    return runtime.scheduler ? runtime.scheduler.add(spec) : null;
  }

  /**
   * Registers a hook implementation. Services call each other through hooks
   * so modules do not import each other in circles.
   *
   * @param {string} name Hook name.
   * @param {Function} fn Implementation.
   * @returns {void}
   */
  function provide(name, fn) {
    hooks.set(name, fn);
  }

  /**
   * Calls a hook. Missing hooks are a programming error.
   *
   * @param {string} name Hook name.
   * @param {...*} args Arguments.
   * @returns {*} Result.
   */
  function call(name, ...args) {
    const fn = hooks.get(name);
    if (!fn) {
      throw new Error(`${SCRIPT_NAME}: hook ${name} is not registered`);
    }
    return fn(...args);
  }

  /**
   * Calls a hook when it is registered.
   *
   * @param {string} name Hook name.
   * @param {...*} args Arguments.
   * @returns {*} Result, or undefined.
   */
  function maybeCall(name, ...args) {
    const fn = hooks.get(name);
    return fn ? fn(...args) : undefined;
  }

  /**
   * Writes a diagnostic line when diagnostic logging is on.
   *
   * @param {string} text Text.
   * @returns {void}
   */
  function diag(text) {
    if (getState()?.config?.diagnostics) {
      logLine(`[diag] ${text}`);
    }
  }

  // Bounded audit trail, terminal-run history and missed-work incidents
  // (plan §7.2, §9). Limits trim the oldest records; unresolved incident
  // counts are aggregated, never dropped.

  const MAX_RESOLVED_INCIDENTS = 200;

  /**
   * Appends an audit entry.
   *
   * @param {string} kind Entry kind (e.g. `run.start`, `definition.publish`).
   * @param {object} [detail] Short, redacted detail.
   * @returns {void}
   */
  function audit(kind, detail = {}) {
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
  function recordHistory(summary) {
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
  function count(key, by = 1) {
    const stats = getState().stats;
    stats[key] = (stats[key] || 0) + by;
  }

  /**
   * Returns open incidents (open or acknowledged), newest first.
   *
   * @returns {object[]} Incidents.
   */
  function openIncidents() {
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
  function createIncident(spec) {
    const s = getState();
    const at = now();
    const group =
      spec.group ||
      [spec.kind, spec.scheduleId || spec.runId || spec.definitionId || '', spec.cause].join(':');
    const existing = Object.values(s.incidents).find(
      (i) => i.status === 'open' && i.group === group
    );
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
    audit('incident.create', {
      incident: incident.id,
      cause: incident.cause,
      count: incident.count,
    });
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
  function acknowledgeIncident(id, by) {
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
  function resolveIncident(id, decision, by) {
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
    for (const incident of resolved.slice(
      0,
      Math.max(0, resolved.length - MAX_RESOLVED_INCIDENTS)
    )) {
      delete s.incidents[incident.id];
    }
  }

  const CHAT_CARD_STYLE = [
    'width:100%',
    'border-radius:4px',
    'box-shadow:1px 1px 3px rgba(0,0,0,0.4)',
    'text-align:left',
    'margin:2px auto',
    `border:1px solid ${COLOR_BORDER}`,
    `color:${COLOR_TEXT}`,
    `background-image:-webkit-linear-gradient(135deg,${COLOR_CARD_BG_TOP} 0%,${COLOR_CARD_BG_BOTTOM} 100%)`,
    `background-color:${COLOR_CARD_BG_BOTTOM}`,
    'overflow:hidden',
  ].join(';');

  const CHAT_HEADER_STYLE = [
    `background:${COLOR_HEADER_BG}`,
    `color:${COLOR_HEADER_TEXT}`,
    'padding:4px 8px',
    `border-bottom:2px solid ${COLOR_ACCENT}`,
    'font-variant:small-caps',
    'font-weight:bold',
    'font-size:1.05em',
    'text-align:center',
    'letter-spacing:0.05em',
  ].join(';');

  const CHAT_CONTENT_STYLE = 'padding:5px 8px;line-height:1.5';

  const BUTTON_STYLE = [
    `background:${COLOR_BUTTON_BG}`,
    `color:${COLOR_BUTTON_TEXT}`,
    'padding:2px 7px',
    'border-radius:3px',
    'text-decoration:none',
    'font-size:0.9em',
    'display:inline-block',
    'margin:1px 2px',
  ].join(';');

  const BUTTON_SECONDARY_STYLE = [
    `background:${COLOR_BUTTON_ALT_BG}`,
    `color:${COLOR_TEXT}`,
    `border:1px solid ${COLOR_BUTTON_ALT_BORDER}`,
    'padding:2px 7px',
    'border-radius:3px',
    'text-decoration:none',
    'font-size:0.9em',
    'display:inline-block',
    'margin:1px 2px',
  ].join(';');

  const SECTION_LABEL_STYLE = [
    `color:${COLOR_MUTED}`,
    'font-size:0.8em',
    'text-transform:uppercase',
    'letter-spacing:0.08em',
    'margin-top:4px',
    'margin-bottom:2px',
  ].join(';');

  const DIVIDER_STYLE = `border:none;border-top:1px solid ${COLOR_BORDER};margin:4px 0`;

  /**
   * Returns the whisper target for a player, falling back to all GMs.
   *
   * Double quotes are stripped so the name is safe inside /w "name".
   *
   * @param {string} [playerId] Roll20 player ID.
   * @returns {string} Whisper target text.
   */
  function whisperTarget(playerId) {
    const player = playerId && playerId !== 'API' ? getObject('player', playerId) : null;
    if (!player) {
      return 'gm';
    }
    return `"${String(player.get('displayname') || playerId).replaceAll('"', '')}"`;
  }

  /**
   * Sends a styled card whispered to a player, or to every GM when no player is given.
   *
   * @param {string|null} playerId Roll20 player ID.
   * @param {string} title Card header text.
   * @param {string|string[]} content HTML body content.
   * @returns {void}
   */
  function whisper(playerId, title, content) {
    const body = Array.isArray(content) ? content.join('') : content;
    chat(SCRIPT_NAME, `/w ${whisperTarget(playerId)} ${buildCard(title, body)}`, {
      noarchive: true,
    });
  }

  /**
   * Sends an error whispered to a player (or every GM).
   *
   * @param {string|null} playerId Roll20 player ID.
   * @param {string} message What went wrong.
   * @param {string} [hint] How to fix it.
   * @returns {void}
   */
  function whisperError(playerId, message, hint) {
    const style = [
      `background:${COLOR_ERROR_BG}`,
      `color:${COLOR_ERROR_TEXT}`,
      `border:1px solid ${COLOR_ERROR_BORDER}`,
      'padding:4px 8px',
      'border-radius:4px',
      'font-size:0.95em',
    ].join(';');
    const hintHtml = hint
      ? `<div style="margin-top:3px;font-size:0.9em">${escapeHtml(hint)}</div>`
      : '';
    const html = `<div style="${style}"><strong>${escapeHtml(message)}</strong>${hintHtml}</div>`;
    chat(SCRIPT_NAME, `/w ${whisperTarget(playerId)} ${html}`, { noarchive: true });
  }

  /**
   * Builds a styled chat card.
   *
   * @param {string} title Header text (escaped).
   * @param {string} body Body HTML (trusted).
   * @returns {string} HTML string.
   */
  function buildCard(title, body) {
    return [
      `<div style="${CHAT_CARD_STYLE}">`,
      `<div style="${CHAT_HEADER_STYLE}">${escapeHtml(title)}</div>`,
      `<div style="${CHAT_CONTENT_STYLE}">${body}</div>`,
      '</div>',
    ].join('');
  }

  /**
   * Builds a primary action button.
   *
   * @param {string} label Button label.
   * @param {string} command Chat command the button runs.
   * @returns {string} HTML anchor.
   */
  function buildButton(label, command) {
    return `<a href="${escapeHtml(command)}" style="${BUTTON_STYLE}">${escapeHtml(label)}</a>`;
  }

  /**
   * Builds a secondary action button.
   *
   * @param {string} label Button label.
   * @param {string} command Chat command the button runs.
   * @returns {string} HTML anchor.
   */
  function buildSecondaryButton(label, command) {
    return `<a href="${escapeHtml(command)}" style="${BUTTON_SECONDARY_STYLE}">${escapeHtml(label)}</a>`;
  }

  /**
   * Builds a section label.
   *
   * @param {string} text Label text.
   * @returns {string} HTML string.
   */
  function buildSectionLabel(text) {
    return `<div style="${SECTION_LABEL_STYLE}">${escapeHtml(text)}</div>`;
  }

  /**
   * Builds a horizontal divider.
   *
   * @returns {string} HTML string.
   */
  function buildDivider() {
    return `<hr style="${DIVIDER_STYLE}">`;
  }

  /**
   * Builds a label/value row. The value may be trusted HTML (e.g. a button).
   *
   * @param {string} label Label text (escaped).
   * @param {string} valueHtml Value HTML.
   * @returns {string} HTML string.
   */
  function buildRow(label, valueHtml) {
    return [
      '<table style="width:100%;border-collapse:collapse;margin:1px 0"><tr>',
      `<td style="color:${COLOR_MUTED};width:50%;font-size:0.9em">${escapeHtml(label)}</td>`,
      `<td style="text-align:right;width:50%">${valueHtml}</td>`,
      '</tr></table>',
    ].join('');
  }

  // Declarative description of every step type: its fields, replay class and
  // who may use it (plan §4.4). The executor (actions.js) supplies behaviour;
  // the validator (schema.js) uses these specs. Pure: no Roll20 globals.

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

  const STEP_SPECS = {
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
      fields: {
        target: f('target', { required: true }),
        property: f('string', { required: true }),
      },
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
  const SUSPENDING = new Set(['wait', 'awaitEvent']);

  /**
   * Returns the full allowed field map of a step type (common + specific).
   *
   * @param {string} type Step type.
   * @returns {object|null} Field specs, or null for unknown types.
   */
  function stepFields(type) {
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
  function replayClass(step, adapter) {
    if (step.type === 'marker.set' && ['toggle', 'adjust'].includes(step.op)) {
      return REPLAY.NON_IDEMPOTENT;
    }
    if (step.type === 'integration.call' && adapter?.replay) {
      return adapter.replay;
    }
    return STEP_SPECS[step.type]?.replay ?? REPLAY.NON_IDEMPOTENT;
  }

  const EVENT_TYPES = [
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

  const TRIGGER_TYPES = ['manual', 'at', 'interval', 'daily', 'weekly', 'event', 'signal', 'chat'];
  const TIME_TRIGGER_TYPES = new Set(['at', 'interval', 'daily', 'weekly']);

  // Safe structured expressions (plan §4.3). Expressions are JSON trees, never
  // source code: no eval, no functions, no prototype walking, no regular
  // expressions. Missing values stay missing and never turn into zero.
  // Pure: references are resolved through a callback supplied by the caller.

  /** The typed "no value" result. Comparisons with it are false. */
  const MISSING = Object.freeze({ missing: true });

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

  const OPERATORS = Object.freeze([...BINARY, ...UNARY, ...NARY, 'if']);

  const REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*$/;

  /**
   * Returns whether an evaluated value counts as true. Missing is false.
   *
   * @param {*} value Value.
   * @returns {boolean} Truthiness.
   */
  function truthy(value) {
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
  function validateExpression(node, { roots, path = '$', limits = DEFAULT_LIMITS }) {
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
          errors.push({
            path: at,
            code: 'unknownField',
            vars: { field: Object.keys(n).join(', ') },
          });
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
   * Converts a value as `ref.as` asks. Malformed numbers are missing, not zero.
   *
   * @param {*} value Value.
   * @param {string} [as] Target type.
   * @returns {*} Converted value or MISSING.
   */
  function convert(value, as) {
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
  function evaluate(node, ctx) {
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
  function renderTemplate(template, resolve, sanitise) {
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
  function templatePaths(template) {
    return [...String(template).matchAll(/\{\{\s*([A-Za-z_][A-Za-z0-9_.]*)\s*\}\}/g)].map(
      (m) => m[1]
    );
  }

  // Time schedule arithmetic (plan §5): one-off, fixed-rate and fixed-delay
  // intervals, and daily/weekly calendar times at a fixed UTC offset. Missed
  // occurrences are counted with arithmetic, never by walking years of times.
  // Pure: no Roll20 globals and no host timezone.

  const DAY_MS = 24 * 60 * 60 * 1000;
  // 1970-01-01 was a Thursday.
  const EPOCH_WEEKDAY = 4;

  /**
   * Parses `HH:MM` (24-hour) into milliseconds after midnight.
   *
   * @param {*} raw Raw input.
   * @returns {number|null} Milliseconds, or null when invalid.
   */
  function parseClockTime(raw) {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(raw ?? '').trim());
    return match ? (Number(match[1]) * 60 + Number(match[2])) * 60000 : null;
  }

  /**
   * Parses weekday names (`mon,wed` or `mon wed`) into sorted day numbers.
   *
   * @param {*} raw Raw input (string or array).
   * @returns {number[]|null} Day numbers (0 = Sunday), or null when invalid.
   */
  function parseWeekdays(raw) {
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
  function nextAtOrAfter(spec, t) {
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
  function nextAfter(spec, t) {
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
  function countBetween(spec, from, to) {
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
  function listFrom(spec, from, limit, to = Infinity) {
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
  function normaliseSpec(raw, { minIntervalMs }) {
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

  // Runtime validator and compiler for task definitions (plan §12.1). It
  // enforces the same rules as schema/task-definition.schema.json plus the
  // checks JSON Schema cannot express: unique step IDs, reference roots, loop
  // safety, parallel limits and call cycles. Pure: no Roll20 globals.

  const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,47}$/;

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
  function durationValue(raw) {
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
  function checkParamValue(spec, value) {
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
        return typeof value === 'boolean'
          ? { ok: true, value }
          : { ok: false, error: 'notBoolean' };
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
          if (
            spec.query.evaluate !== undefined &&
            !['start', 'step'].includes(spec.query.evaluate)
          ) {
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
          if (
            !STEP_ROOTS.has(root) &&
            !(root === 'args' && ctx.stepType === 'integration.command')
          ) {
            out.add(at, 'refRoot', {
              root: path.split('.')[0],
              allowed: [...STEP_ROOTS].join(', '),
            });
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
                !['sum', 'min', 'max', 'first', 'last', 'count', 'all', 'any'].includes(
                  rule.reducer
                )
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
  function blockAlwaysSuspends(steps) {
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
  function validateDefinition(def, { limits = DEFAULT_LIMITS } = {}) {
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
  function compileDefinition(def) {
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
  function findCallCycle(startId, callsOf) {
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
  function describePath(path) {
    const match = /^step:([^.]+)(?:\.(.+))?$/.exec(path);
    if (match) {
      return match[2] ? `${match[1]}: ${match[2]}` : match[1];
    }
    return path;
  }

  // Definition service (plan §3, §4): drafts, validation, immutable published
  // revisions, enable/disable, clone, import/export and purge. Runs pin a
  // revision; editing a definition only affects future runs.

  const compiledCache = new Map();

  /**
   * Returns a new empty definition body.
   *
   * @param {string} id Definition ID.
   * @param {string} name Name.
   * @returns {object} Definition.
   */
  function blankDefinition(id, name) {
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
  function getRecord(id) {
    return getState().definitions[id] || null;
  }

  /**
   * Returns definition records, sorted by name.
   *
   * @param {{archived?: boolean}} [options] Include archived records.
   * @returns {object[]} Records.
   */
  function listRecords({ archived = false } = {}) {
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
  function getSnapshot(id, revision) {
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
  function getCompiled(id, revision) {
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
  function freeId(name) {
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
  function createRecord(body, by) {
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
  function revisionMatches(record, expected) {
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
  function updateDraft(id, change, by, expectedRev) {
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
  function validateBody(body) {
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
  function adaptersUsed(body) {
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
  function walkSteps(steps, visit) {
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
  function publish(id, by, expectedRev) {
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
  function setEnabled(id, enabled, by, { expectedRev, reason = 'gm' } = {}) {
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
  function cloneRecord(id, name, by, newId) {
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
  function referencedRevisions(id) {
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
  function pruneRevisions(id) {
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
  function dependencies(id) {
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
  function archiveRecord(id, by) {
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
  function purgeRecord(id, by) {
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
  function importDefinition(body, by, { replace = false } = {}) {
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
  function exportDefinition(id, { draft = false } = {}) {
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
  function findStepLocation(steps, stepId) {
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
  function blockList(draft, block) {
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

  // Typed task errors (plan §10, §14). Commands, run journals and the dashboard
  // distinguish these codes so every failure says what kind of problem it is.

  // Codes that may succeed if tried again later.
  const TRANSIENT = new Set([
    ERROR_CODES.UNAVAILABLE,
    ERROR_CODES.TIMEOUT,
    ERROR_CODES.RESOURCE_LIMIT,
  ]);

  /**
   * Creates a typed error.
   *
   * @param {string} code One of ERROR_CODES.
   * @param {string} reason Translation key suffix under `runErrors.`.
   * @param {object} [vars] Interpolation values (IDs, names; never secrets).
   * @param {{transient?: boolean, uncertain?: boolean}} [flags] Overrides.
   * @returns {Error} Error with code, reason, vars, transient and uncertain.
   */
  function taskError(code, reason, vars = {}, flags = {}) {
    const err = new Error(`${code}:${reason}`);
    err.taskError = true;
    err.code = code;
    err.reason = reason;
    err.vars = vars;
    err.transient = flags.transient ?? TRANSIENT.has(code);
    err.uncertain = flags.uncertain ?? code === ERROR_CODES.UNCERTAIN;
    return err;
  }

  /**
   * Converts anything thrown into a typed error.
   *
   * @param {*} err Thrown value.
   * @returns {Error} Typed error.
   */
  function asTaskError(err) {
    if (err?.taskError) {
      return err;
    }
    return taskError(ERROR_CODES.INTERNAL, 'internal', {
      message: String(err?.message || err).slice(0, 200),
    });
  }

  /**
   * Returns a compact, storable description of an error.
   *
   * @param {Error} err Typed error.
   * @param {string} [stepId] Step that failed.
   * @returns {{code: string, reason: string, vars: object, stepId: string|null}} Record.
   */
  function errorRecord(err, stepId) {
    const typed = asTaskError(err);
    return { code: typed.code, reason: typed.reason, vars: typed.vars, stepId: stepId || null };
  }

  // Trusted adapter registry (plan §11). Other Mods register adapters through
  // the global TaskAutomation API, or before it exists by pushing specs onto
  // globalThis.TaskAutomationQueue. Registration is idempotent; late
  // registration lets the GM resume runs that were waiting for the adapter.

  const ADAPTER_CONTRACT = 1;

  const adapters = new Map();
  const referenceStore = new Map();

  /**
   * Validates an adapter spec.
   *
   * @param {*} spec Adapter spec.
   * @returns {{ok: boolean, error?: string}} Result.
   */
  function checkAdapterSpec(spec) {
    if (!isRecord(spec) || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,47}$/.test(toText(spec.name))) {
      return { ok: false, error: 'adapterName' };
    }
    if (spec.contract !== ADAPTER_CONTRACT) {
      return { ok: false, error: 'adapterContract' };
    }
    if (!isRecord(spec.actions) || Object.keys(spec.actions).length === 0) {
      return { ok: false, error: 'adapterActions' };
    }
    for (const [name, action] of Object.entries(spec.actions)) {
      if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,47}$/.test(name) || typeof action?.invoke !== 'function') {
        return { ok: false, error: 'adapterActions' };
      }
      if (action.replay !== undefined && !Object.values(REPLAY).includes(action.replay)) {
        return { ok: false, error: 'adapterReplay' };
      }
    }
    return { ok: true };
  }

  /**
   * Registers (or re-registers) an adapter.
   *
   * Spec: { name, contract: 1, version, description, authority: 'gm'|'any',
   *   actions: { [name]: { invoke(input, ctx, done), replay, timeoutMs,
   *   status?(key) -> {done, result}|null, cancel?(opId) } }, events?: [names] }
   *
   * @param {object} spec Adapter spec.
   * @returns {{ok: boolean, error?: string}} Result.
   */
  function registerAdapter(spec) {
    const check = checkAdapterSpec(spec);
    if (!check.ok) {
      logLine(`adapter rejected (${check.error}): ${toText(spec?.name)}`);
      return check;
    }
    const isNew = !adapters.has(spec.name);
    adapters.set(spec.name, { ...spec, registeredAt: now() });
    if (isNew) {
      audit('adapter.register', { adapter: spec.name, version: toText(spec.version) });
      maybeCall('adapterRegistered', spec.name);
    }
    maybeCall('dashboardDirty', 'integrations');
    return { ok: true };
  }

  /**
   * Drains adapters queued before the Mod loaded.
   *
   * @returns {number} Adapters registered.
   */
  function drainRegistrationQueue() {
    const queue = Array.isArray(globalThis.TaskAutomationQueue)
      ? globalThis.TaskAutomationQueue
      : [];
    let count = 0;
    for (const spec of queue.splice(0)) {
      if (registerAdapter(spec).ok) {
        count += 1;
      }
    }
    return count;
  }

  /**
   * Returns an adapter.
   *
   * @param {string} name Adapter name.
   * @returns {object|null} Adapter.
   */
  function getAdapter(name) {
    return adapters.get(name) || null;
  }

  /**
   * Returns all registered adapters.
   *
   * @returns {object[]} Adapters.
   */
  function listAdapters() {
    return [...adapters.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Registers the built-in reference adapter used by the examples and tests.
   * It acknowledges calls immediately (`echo`), after a delay on the shared
   * scheduler (`delayedEcho`), or never (`silent`, to show timeouts), and
   * answers status lookups by idempotency key.
   *
   * @returns {void}
   */
  function registerReferenceAdapter() {
    onJob(JOB.MAINTENANCE + ':referenceAck', (job) => {
      const { key, input, done } = job.target;
      referenceStore.set(key, { done: true, result: { echo: input } });
      done(null, { echo: input });
    });
    registerAdapter({
      name: 'reference',
      contract: ADAPTER_CONTRACT,
      version: '1.0.0',
      description: `${SCRIPT_NAME} reference adapter`,
      authority: 'gm',
      actions: {
        echo: {
          replay: REPLAY.ACKNOWLEDGED,
          invoke(input, ctx, done) {
            referenceStore.set(ctx.idempotencyKey, { done: true, result: { echo: input } });
            done(null, { echo: input });
          },
          status(key) {
            return referenceStore.get(key) || null;
          },
        },
        delayedEcho: {
          replay: REPLAY.ACKNOWLEDGED,
          timeoutMs: 10000,
          invoke(input, ctx, done) {
            const delay = Math.min(Math.max(Number(input?.delayMs) || 1000, 100), 9000);
            schedule({
              kind: `${JOB.MAINTENANCE}:referenceAck`,
              dueAt: now() + delay,
              target: { key: ctx.idempotencyKey, input, done },
            });
          },
          status(key) {
            return referenceStore.get(key) || null;
          },
        },
        silent: {
          replay: REPLAY.ACKNOWLEDGED,
          timeoutMs: 2000,
          invoke() {},
        },
      },
    });
  }

  // Reading Roll20 objects for tasks: binding resolution, targets, allowlisted
  // property reads, control checks and multi-sided tokens (plan §4.1).

  const READABLE = {
    graphic: TOKEN_READ_PROPERTIES,
    attribute: ATTRIBUTE_READ_PROPERTIES,
    character: CHARACTER_READ_PROPERTIES,
    player: PLAYER_READ_PROPERTIES,
    page: PAGE_READ_PROPERTIES,
    jukeboxtrack: ['title', 'playing', 'volume', 'loop'],
  };

  // Roll20 stores a few properties under other names.
  const PROPERTY_ALIASES = {
    pageid: '_pageid',
    represents: 'represents',
    online: '_online',
    currentSide: 'currentSide',
  };

  /**
   * Returns a Roll20 object of a type, treating graphics that are not tokens
   * (cards, map images) as missing.
   *
   * @param {string} type Object type.
   * @param {string} id Object ID.
   * @returns {object|null} Object.
   */
  function getTarget(type, id) {
    const obj = getObject(type, id);
    if (obj && type === 'graphic' && obj.get('_subtype') !== 'token') {
      return null;
    }
    return obj;
  }

  /**
   * Finds the type of an object ID among the types tasks use.
   *
   * @param {string} id Object ID.
   * @returns {{type: string, obj: object}|null} Type and object.
   */
  function findAnyTarget(id) {
    for (const type of ['graphic', 'character', 'attribute', 'player', 'page', 'jukeboxtrack']) {
      const obj = getTarget(type, id);
      if (obj) {
        return { type, obj };
      }
    }
    return null;
  }

  /**
   * Reads an allowlisted property, returning plain data only.
   *
   * @param {object} obj Roll20 object.
   * @param {string} type Object type.
   * @param {string} prop Property.
   * @returns {{found: boolean, value?: *}} Result.
   */
  function readProperty(obj, type, prop) {
    if (prop === 'id') {
      return { found: true, value: obj.id };
    }
    if (!(READABLE[type] || []).includes(prop)) {
      return { found: false };
    }
    let value = obj.get(PROPERTY_ALIASES[prop] || prop);
    if (value === undefined && PROPERTY_ALIASES[prop]) {
      value = obj.get(prop);
    }
    if (value === undefined || value === null) {
      return { found: false };
    }
    if (typeof value === 'object') {
      return { found: false };
    }
    return { found: true, value };
  }

  /**
   * Takes a compact snapshot of a token's allowlisted properties.
   *
   * @param {object} obj Roll20 object or a plain attribute map.
   * @param {string} type Object type.
   * @returns {object} Snapshot.
   */
  function snapshot(obj, type) {
    const out = {};
    const get = typeof obj?.get === 'function' ? (k) => obj.get(k) : (k) => obj?.[k];
    for (const prop of READABLE[type] || []) {
      let value = get(PROPERTY_ALIASES[prop] || prop);
      if (value === undefined && PROPERTY_ALIASES[prop]) {
        value = get(prop);
      }
      if (value !== undefined && value !== null && typeof value !== 'object') {
        out[prop] = typeof value === 'string' && value.length > 500 ? value.slice(0, 500) : value;
      }
    }
    return out;
  }

  /**
   * Returns the player IDs that control an object. `all` means everyone.
   * Journal visibility is not control.
   *
   * @param {object} obj Roll20 graphic or character.
   * @param {string} type Object type.
   * @returns {string[]} Controller IDs (may include 'all').
   */
  function controllersOf(obj, type) {
    const split = (raw) =>
      toText(raw)
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
    if (type === 'character') {
      return split(obj.get('controlledby'));
    }
    if (type === 'graphic') {
      const own = split(obj.get('controlledby'));
      const charId = toText(obj.get('represents'));
      const character = charId ? getObject('character', charId) : null;
      return [...new Set([...own, ...(character ? split(character.get('controlledby')) : [])])];
    }
    if (type === 'attribute') {
      const character = getObject('character', toText(obj.get('_characterid')));
      return character ? split(character.get('controlledby')) : [];
    }
    return [];
  }

  /**
   * Returns true when a player may act on an object. GMs control everything.
   *
   * @param {string} playerId Player ID.
   * @param {object} obj Roll20 object.
   * @param {string} type Object type.
   * @returns {boolean} True when controlled.
   */
  function playerControls(playerId, obj, type) {
    if (isGm(playerId)) {
      return true;
    }
    const controllers = controllersOf(obj, type);
    return controllers.includes('all') || controllers.includes(playerId);
  }

  /**
   * Returns the character an object stands for: the character itself, or the
   * character a token represents.
   *
   * @param {object} obj Roll20 object.
   * @param {string} type Object type.
   * @returns {object|null} Character.
   */
  function characterOf(obj, type) {
    if (type === 'character') {
      return obj;
    }
    if (type === 'graphic') {
      const id = toText(obj.get('represents'));
      return id ? getObject('character', id) : null;
    }
    return null;
  }

  /**
   * Finds a character's attribute by exact name.
   *
   * @param {string} characterId Character ID.
   * @param {string} name Attribute name.
   * @returns {object|null} Attribute.
   */
  function findAttribute(characterId, name) {
    return findObjects({ _type: 'attribute', _characterid: characterId, name })[0] || null;
  }

  /**
   * Runs a bounded binding query against the game.
   *
   * @param {object} query Query spec {name, pageId, represents, layer, marker, max}.
   * @param {string} objectType Object type.
   * @returns {string[]} Matching IDs (at most query.max).
   */
  function runQuery(query, objectType) {
    const filter = { _type: objectType };
    if (objectType === 'graphic') {
      filter._subtype = 'token';
    }
    if (query.pageId) {
      filter._pageid = query.pageId;
    }
    if (query.name) {
      filter.name = query.name;
    }
    if (query.represents) {
      filter.represents = query.represents;
    }
    if (query.layer) {
      filter.layer = query.layer;
    }
    let found = findObjects(filter);
    if (query.marker) {
      found = found.filter((o) =>
        parseMarkers(o.get('statusmarkers')).some((m) => m.tag === query.marker)
      );
    }
    return found.slice(0, query.max).map((o) => o.id);
  }

  /**
   * Resolves the bindings of a definition for a new run.
   *
   * @param {object} def Definition snapshot.
   * @param {object} sources Where values come from.
   * @param {string[]} [sources.selected] Selected IDs from the start command.
   * @param {string|null} [sources.eventObjectId] Object of the triggering event.
   * @param {object} [sources.explicit] Explicit IDs per binding (`--bind name=id,id`).
   * @param {object} [sources.params] Resolved parameters.
   * @param {boolean} [sources.unattended] True for schedule/event starts.
   * @returns {{ok: boolean, bindings?: object, errors?: object[]}} Result.
   */
  function resolveBindings(def, sources) {
    const bindings = {};
    const errors = [];
    for (const [name, spec] of Object.entries(def.bindings || {})) {
      let from = spec.from;
      let ids = [];
      const explicit = sources.explicit?.[name];
      if (explicit !== undefined && explicit !== 'selected') {
        ids = explicit;
        from = 'explicit';
      } else if (from === 'selected' && (sources.unattended || !sources.selected)) {
        if (!spec.alternate) {
          errors.push({ binding: name, code: 'selectionUnavailable' });
          continue;
        }
        from = spec.alternate.from;
        if (from === 'ids') {
          ids = spec.alternate.ids || [];
        }
      }
      switch (from) {
        case 'selected':
          ids = sources.selected || [];
          break;
        case 'ids':
          ids = ids.length ? ids : spec.ids || [];
          break;
        case 'event':
          ids = sources.eventObjectId ? [sources.eventObjectId] : [];
          break;
        case 'param': {
          const value = sources.params?.[spec.param];
          ids = typeof value === 'string' && value ? [value] : [];
          break;
        }
        case 'query':
          // Snapshot at start unless the definition asks for per-step evaluation.
          ids = spec.query.evaluate === 'step' ? [] : runQuery(spec.query, spec.objectType);
          break;
      }
      const unique = [...new Set(ids.filter((id) => typeof id === 'string' && id))];
      const valid = [];
      for (const id of unique) {
        const obj = getTarget(spec.objectType, id);
        if (!obj && spec.objectType === 'character' && getTarget('graphic', id)) {
          // A selected token stands for the character it represents.
          const character = characterOf(getTarget('graphic', id), 'graphic');
          if (character) {
            valid.push(character.id);
            continue;
          }
        }
        if (!obj) {
          errors.push({ binding: name, code: 'targetMissing', id });
          continue;
        }
        valid.push(id);
      }
      const max = spec.max ?? 20;
      if (valid.length > max) {
        errors.push({ binding: name, code: 'tooManyTargets', max });
        continue;
      }
      const min =
        spec.min ??
        (from === 'none' || spec.from === 'none' || spec.query?.evaluate === 'step' ? 0 : 1);
      if (valid.length < min) {
        errors.push({ binding: name, code: 'noTargets' });
        continue;
      }
      bindings[name] = [...new Set(valid)];
    }
    return errors.length ? { ok: false, errors } : { ok: true, bindings };
  }

  /**
   * Parses a token's `sides` into image URLs.
   *
   * @param {object} token Roll20 graphic.
   * @returns {string[]} Side image URLs.
   */
  function tokenSides(token) {
    return toText(token.get('sides'))
      .split('|')
      .filter(Boolean)
      .map((side) => {
        try {
          return decodeURIComponent(side);
        } catch {
          return side;
        }
      });
  }

  /**
   * Converts a library image URL into the form the API may write to `imgsrc`
   * (the `thumb` size). Marketplace and external images cannot be set by the
   * API, so they return null.
   *
   * @param {string} url Image URL.
   * @returns {string|null} Writable URL, or null.
   */
  function writableImage(url) {
    const match =
      /^(https:\/\/s3\.amazonaws\.com\/files\.d20\.io\/images\/(?:.*?)\/)(?:thumb|med|original|max)([^?]*)(\?[^?]+)?$/.exec(
        toText(url)
      );
    if (!match) {
      const alt =
        /^(https:\/\/files\.d20\.io\/images\/(?:.*?)\/)(?:thumb|med|original|max)([^?]*)(\?[^?]+)?$/.exec(
          toText(url)
        );
      if (!alt) {
        return null;
      }
      return `${alt[1]}thumb${alt[2]}${alt[3] || `?${Date.now()}`}`;
    }
    return `${match[1]}thumb${match[2]}${match[3] || `?${Date.now()}`}`;
  }

  /**
   * Returns a token's current side as a 0-based index.
   *
   * @param {object} token Roll20 graphic.
   * @returns {number} Index.
   */
  function currentSideIndex(token) {
    const raw = Number(token.get('currentSide'));
    return Number.isInteger(raw) && raw >= 0 ? raw : 0;
  }

  /**
   * Returns a compact label for an object.
   *
   * @param {string} id Object ID.
   * @returns {string} Name, or the ID.
   */
  function targetLabel(id) {
    const found = findAnyTarget(id);
    if (!found) {
      return id;
    }
    const name = toText(
      found.obj.get(
        found.type === 'player' ? 'displayname' : found.type === 'jukeboxtrack' ? 'title' : 'name'
      )
    );
    return name || id;
  }

  /**
   * Normalises a recipients spec into whisper names and player IDs.
   *
   * @param {object} to Recipients spec.
   * @param {object} inst Instance (for bindings and initiator).
   * @returns {{gm: boolean, players: string[]}} Recipients.
   */
  function resolveRecipients(to, inst) {
    const result = { gm: Boolean(to?.gm), players: [] };
    if (!isRecord(to)) {
      return result;
    }
    if (Array.isArray(to.players)) {
      result.players.push(...to.players.filter((p) => getObject('player', p)));
    }
    if (to.initiator && inst.initiatorPlayerId) {
      result.players.push(inst.initiatorPlayerId);
    }
    for (const key of ['binding', 'controllers']) {
      if (to[key]) {
        for (const id of inst.bindings?.[to[key]] || []) {
          const found = findAnyTarget(id);
          if (found?.type === 'player') {
            result.players.push(id);
          } else if (found) {
            result.players.push(...controllersOf(found.obj, found.type).filter((p) => p !== 'all'));
          }
        }
      }
    }
    result.players = [...new Set(result.players)];
    return result;
  }

  // Built-in actions (plan §4.4). Each action validates live values, checks
  // authority for every object it touches, records what it intends before
  // writing, and reports a result. Flow steps live in executor.js.

  const rateWindows = new Map();

  /**
   * Applies a rolling per-minute limit.
   *
   * @param {string} key Limit key.
   * @param {number} max Maximum per minute.
   * @returns {void}
   * @throws {Error} resourceLimit when exceeded.
   */
  function rateLimit(key, max) {
    const at = now();
    const window = rateWindows.get(key) || { start: at, count: 0 };
    if (at - window.start > 60000) {
      window.start = at;
      window.count = 0;
    }
    window.count += 1;
    rateWindows.set(key, window);
    if (window.count > max) {
      throw taskError(ERROR_CODES.RESOURCE_LIMIT, 'rateLimited', { what: key.split(':')[0], max });
    }
  }

  /**
   * Returns true when a run acts with GM authority.
   *
   * @param {object} inst Instance.
   * @returns {boolean} True for GM-service runs and runs a GM started.
   */
  function hasGmAuthority$1(inst) {
    return inst.authority === 'gmService' || isGm(inst.initiatorPlayerId);
  }

  /**
   * Evaluates an expression and rejects missing values.
   *
   * @param {object} ctx Action context.
   * @param {*} expr Expression.
   * @param {string} field Field name for the error.
   * @returns {*} Value.
   */
  function required(ctx, expr, field) {
    const value = ctx.evaluate(expr);
    if (value === MISSING || value === undefined) {
      throw taskError(ERROR_CODES.VALIDATION, 'valueMissing', { field });
    }
    return value;
  }

  /**
   * Iterates targets in bounded chunks. Targets already handled by an earlier
   * chunk of the same attempt are skipped.
   *
   * @param {object} ctx Action context.
   * @param {{id: string, obj: object, type: string}[]} targets Targets.
   * @param {(target: object) => void} fn Per-target work.
   * @returns {{done: string[], partial: boolean}} Progress.
   */
  function forTargets(ctx, targets, fn) {
    const done = new Set(ctx.progress || []);
    let writes = 0;
    for (const target of targets) {
      if (done.has(target.id)) {
        continue;
      }
      if (writes >= getLimits().targetsPerChunk) {
        return { done: [...done], partial: true };
      }
      fn(target);
      done.add(target.id);
      writes += 1;
    }
    return { done: [...done], partial: false };
  }

  /**
   * Writes token properties and announces the change internally, since
   * Roll20 does not raise change events for API writes.
   *
   * @param {object} ctx Action context.
   * @param {object} obj Roll20 graphic.
   * @param {object} changes Properties to set.
   * @returns {void}
   */
  function writeToken(ctx, obj, changes) {
    const before = snapshot(obj, 'graphic');
    obj.set(changes);
    ctx.noteWrite(obj.id, changes);
    ctx.emit({
      type: 'token.change',
      objectType: 'graphic',
      objectId: obj.id,
      old: before,
      new: snapshot(obj, 'graphic'),
      pageId: obj.get('_pageid'),
    });
  }

  /**
   * Converts a value for a token property.
   *
   * @param {string} prop Property.
   * @param {*} value Value.
   * @param {object} inst Instance.
   * @returns {*} Converted value.
   */
  function tokenValue(prop, value, inst) {
    const kind = TOKEN_WRITE_PROPERTIES[prop];
    if (TOKEN_GM_PROPERTIES.has(prop) && !hasGmAuthority$1(inst)) {
      throw taskError(ERROR_CODES.UNAUTHORIZED, 'gmProperty', { property: prop });
    }
    switch (kind) {
      case 'number': {
        const n = parseStrictNumber(value);
        if (n === null) {
          throw taskError(ERROR_CODES.VALIDATION, 'notNumber', { field: prop });
        }
        return n;
      }
      case 'bar':
        if (typeof value === 'number' && Number.isFinite(value)) {
          return value;
        }
        if (typeof value === 'string' && value.length <= 100) {
          return value;
        }
        throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: prop });
      case 'layer':
        if (!LAYERS.includes(value)) {
          throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: prop });
        }
        return value;
      case 'color':
        if (
          typeof value === 'string' &&
          (/^#[0-9a-fA-F]{6}$/.test(value) || value === 'transparent')
        ) {
          return value;
        }
        throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: prop });
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: prop });
        }
        return value;
      case 'string':
        if (typeof value !== 'string' || value.length > 200) {
          throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: prop });
        }
        return value;
      default:
        throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: prop });
    }
  }

  /**
   * Returns the characters for a set of targets (characters, or tokens'
   * represented characters).
   *
   * @param {object[]} targets Targets.
   * @returns {{id: string, obj: object, type: string}[]} Characters.
   */
  function characterTargets(targets) {
    const out = [];
    for (const target of targets) {
      const character = characterOf(target.obj, target.type);
      if (!character) {
        throw taskError(ERROR_CODES.MISSING_TARGET, 'noCharacter', { id: target.id });
      }
      if (!out.some((c) => c.id === character.id)) {
        out.push({ id: character.id, obj: character, type: 'character' });
      }
    }
    return out;
  }

  /**
   * Returns the pixel position and page of the first target, or of `at`.
   *
   * @param {object} ctx Action context.
   * @param {object} step Step.
   * @returns {{left: number, top: number, pageId: string}} Location.
   */
  function locate(ctx, step) {
    if (step.target) {
      const [target] = ctx.targets(step.target, 'graphic');
      return {
        left: Number(target.obj.get('left')),
        top: Number(target.obj.get('top')),
        pageId: target.obj.get('_pageid'),
      };
    }
    const left = parseStrictNumber(required(ctx, step.at.left, 'at.left'));
    const top = parseStrictNumber(required(ctx, step.at.top, 'at.top'));
    const pageId = toText(required(ctx, step.at.page, 'at.page'));
    if (left === null || top === null || !getObject('page', pageId)) {
      throw taskError(ERROR_CODES.MISSING_TARGET, 'badLocation', {});
    }
    return { left, top, pageId };
  }

  /**
   * Formats a chat speaker name.
   *
   * @param {object} step Step.
   * @returns {string} Speaker.
   */
  function speaker(step) {
    return (
      neutraliseChatText(step.as || SCRIPT_NAME)
        .replaceAll('|', '')
        .slice(0, 60) || SCRIPT_NAME
    );
  }

  const ACTIONS = {
    'chat.send'(step, ctx) {
      rateLimit(`chat:${ctx.inst.definitionId}`, getLimits().chatPerMinute);
      const text = neutraliseChatText(
        ctx.render(step.text, (v) => escapeHtml(neutraliseChatText(v)))
      );
      if (!text) {
        throw taskError(ERROR_CODES.VALIDATION, 'emptyMessage', {});
      }
      const mode = step.mode || (step.to ? 'whisper' : 'say');
      const who = speaker(step);
      if (mode === 'whisper') {
        const recipients = resolveRecipients(step.to, ctx.inst);
        if (!recipients.gm && recipients.players.length === 0) {
          throw taskError(ERROR_CODES.MISSING_TARGET, 'noRecipients', {});
        }
        if (recipients.gm) {
          chat(who, `/w gm ${text}`);
        }
        for (const playerId of recipients.players) {
          chat(who, `/w "${playerName(playerId).replaceAll('"', '')}" ${text}`);
        }
        return { result: { sent: recipients.players.length + (recipients.gm ? 1 : 0) } };
      }
      const prefix = { say: '', emote: '/em ', desc: '/desc ' }[mode];
      if (mode === 'desc' && !hasGmAuthority$1(ctx.inst)) {
        throw taskError(ERROR_CODES.UNAUTHORIZED, 'gmOnlyMode', { mode });
      }
      chat(who, `${prefix}${text}`);
      return { result: { sent: 1 } };
    },

    'chat.command'(step, ctx) {
      if (!hasGmAuthority$1(ctx.inst)) {
        throw taskError(ERROR_CODES.UNAUTHORIZED, 'gmOnlyAction', { type: step.type });
      }
      rateLimit(`chat:${ctx.inst.definitionId}`, getLimits().chatPerMinute);
      const text = ctx
        .render(step.text, (v) => escapeHtml(neutraliseChatText(v)))
        .replaceAll(/[\r\n]+/g, ' ')
        .trim();
      if (!text || text.startsWith('!')) {
        throw taskError(ERROR_CODES.VALIDATION, 'badCommand', {});
      }
      chat(speaker(step), text);
      return { result: { sent: 1 } };
    },

    'token.set'(step, ctx) {
      const targets = ctx.targets(step.target, 'graphic');
      ctx.authorise(targets.map((t) => t.id));
      const changes = {};
      for (const [prop, expr] of Object.entries(step.set)) {
        changes[prop] = tokenValue(prop, required(ctx, expr, prop), ctx.inst);
      }
      const expect = {};
      for (const [prop, expr] of Object.entries(step.expect || {})) {
        expect[prop] = ctx.evaluate(expr);
      }
      ctx.prepare({ set: changes });
      const progress = forTargets(ctx, targets, (target) => {
        for (const [prop, value] of Object.entries(expect)) {
          const current = readProperty(target.obj, 'graphic', prop);
          if (!current.found || current.value !== value) {
            throw taskError(ERROR_CODES.CONFLICT, 'expectedValue', {
              id: target.id,
              property: prop,
            });
          }
        }
        writeToken(ctx, target.obj, changes);
      });
      return { result: { changed: progress.done.length }, ...progress };
    },

    'token.get'(step, ctx) {
      const [target] = ctx.targets(step.target, 'graphic');
      const value = readProperty(target.obj, 'graphic', step.property);
      return { result: value.found ? value.value : null };
    },

    'token.advanceSide'(step, ctx) {
      const targets = ctx.targets(step.target, 'graphic');
      ctx.authorise(targets.map((t) => t.id));
      const delta = step.delta ?? 1;
      const wrap = step.wrap !== false;
      const plan = {};
      for (const target of targets) {
        const sides = tokenSides(target.obj);
        if (sides.length < 2) {
          throw taskError(ERROR_CODES.VALIDATION, 'notMultiSided', { id: target.id });
        }
        const current = currentSideIndex(target.obj);
        const dest = wrap
          ? (((current + delta) % sides.length) + sides.length) % sides.length
          : clamp(current + delta, 0, sides.length - 1);
        const image = writableImage(sides[dest]);
        if (!image) {
          throw taskError(
            ERROR_CODES.UNAVAILABLE,
            'sideImageUnsupported',
            { id: target.id, side: dest + 1 },
            { transient: false }
          );
        }
        plan[target.id] = { from: current, to: dest, image };
      }
      // Persist the destination before writing so a restart can reconcile it.
      ctx.prepare({
        resolvedSide: Object.fromEntries(Object.entries(plan).map(([id, p]) => [id, p.to])),
      });
      const progress = forTargets(ctx, targets, (target) => {
        const p = plan[target.id];
        writeToken(ctx, target.obj, { currentSide: p.to, imgsrc: p.image });
      });
      return {
        result: {
          sides: Object.fromEntries(Object.entries(plan).map(([id, p]) => [id, p.to + 1])),
        },
        ...progress,
      };
    },

    'token.setSide'(step, ctx) {
      const targets = ctx.targets(step.target, 'graphic');
      ctx.authorise(targets.map((t) => t.id));
      const side = parseStrictNumber(required(ctx, step.side, 'side'));
      const plan = {};
      for (const target of targets) {
        const sides = tokenSides(target.obj);
        if (!Number.isInteger(side) || side < 1 || side > sides.length) {
          throw taskError(ERROR_CODES.VALIDATION, 'sideOutOfRange', {
            id: target.id,
            max: sides.length,
          });
        }
        const image = writableImage(sides[side - 1]);
        if (!image) {
          throw taskError(
            ERROR_CODES.UNAVAILABLE,
            'sideImageUnsupported',
            { id: target.id, side },
            { transient: false }
          );
        }
        plan[target.id] = image;
      }
      ctx.prepare({ resolvedSide: Object.fromEntries(targets.map((t) => [t.id, side - 1])) });
      const progress = forTargets(ctx, targets, (target) => {
        writeToken(ctx, target.obj, { currentSide: side - 1, imgsrc: plan[target.id] });
      });
      return { result: { side }, ...progress };
    },

    'attribute.set'(step, ctx) {
      const characters = characterTargets(ctx.targets(step.target, 'character'));
      ctx.authorise(characters.map((c) => c.id));
      const field = step.field || 'current';
      const value = required(ctx, step.value, 'value');
      if (typeof value !== 'number' && typeof value !== 'string') {
        throw taskError(ERROR_CODES.VALIDATION, 'badValue', { field: 'value' });
      }
      const expect = step.expect === undefined ? MISSING : ctx.evaluate(step.expect);
      const old = {};
      for (const c of characters) {
        const attr = findAttribute(c.id, step.attribute);
        if (!attr && !step.create) {
          throw taskError(ERROR_CODES.MISSING_TARGET, 'attributeMissing', {
            id: c.id,
            attribute: step.attribute,
          });
        }
        old[c.id] = attr ? attr.get(field) : null;
        if (expect !== MISSING && String(old[c.id]) !== String(expect)) {
          throw taskError(ERROR_CODES.CONFLICT, 'expectedValue', {
            id: c.id,
            property: step.attribute,
          });
        }
      }
      ctx.prepare({ attribute: step.attribute, field, old, value });
      const progress = forTargets(ctx, characters, (c) => {
        let attr = findAttribute(c.id, step.attribute);
        if (!attr) {
          attr = createObject('attribute', {
            characterid: c.id,
            name: step.attribute,
            [field]: value,
          });
        } else {
          setAttribute(attr, field, value, step.useWorker);
        }
        ctx.emit({
          type: 'attribute.change',
          objectType: 'attribute',
          objectId: attr?.id,
          characterId: c.id,
          name: step.attribute,
          old: { [field]: old[c.id] },
          new: { [field]: value },
        });
      });
      return { result: { value }, ...progress };
    },

    'attribute.adjust'(step, ctx) {
      const characters = characterTargets(ctx.targets(step.target, 'character'));
      ctx.authorise(characters.map((c) => c.id));
      const field = step.field || 'current';
      const by = parseStrictNumber(required(ctx, step.by, 'by'));
      if (by === null) {
        throw taskError(ERROR_CODES.VALIDATION, 'notNumber', { field: 'by' });
      }
      const plan = {};
      for (const c of characters) {
        const attr = findAttribute(c.id, step.attribute);
        if (!attr) {
          throw taskError(ERROR_CODES.MISSING_TARGET, 'attributeMissing', {
            id: c.id,
            attribute: step.attribute,
          });
        }
        const oldValue = parseStrictNumber(attr.get(field));
        if (oldValue === null) {
          throw taskError(ERROR_CODES.VALIDATION, 'notNumeric', { attribute: step.attribute });
        }
        let next = oldValue + by;
        if (Number.isFinite(step.min)) {
          next = Math.max(step.min, next);
        }
        if (Number.isFinite(step.max)) {
          next = Math.min(step.max, next);
        }
        plan[c.id] = { attrId: attr.id, old: oldValue, new: next };
      }
      // Old and new values are recorded first: a restart compares, it never adds twice.
      ctx.prepare({ attribute: step.attribute, field, plan });
      const progress = forTargets(ctx, characters, (c) => {
        const attr = getObject('attribute', plan[c.id].attrId);
        setAttribute(attr, field, plan[c.id].new, step.useWorker);
        ctx.emit({
          type: 'attribute.change',
          objectType: 'attribute',
          objectId: attr.id,
          characterId: c.id,
          name: step.attribute,
          old: { [field]: plan[c.id].old },
          new: { [field]: plan[c.id].new },
        });
      });
      return {
        result: { values: Object.fromEntries(Object.entries(plan).map(([id, p]) => [id, p.new])) },
        ...progress,
      };
    },

    'attribute.get'(step, ctx) {
      const [character] = characterTargets(ctx.targets(step.target, 'character'));
      const attr = findAttribute(character.id, step.attribute);
      return { result: attr ? attr.get(step.field || 'current') : null };
    },

    'marker.set'(step, ctx) {
      const targets = ctx.targets(step.target, 'graphic');
      ctx.authorise(targets.map((t) => t.id));
      if (!/^[A-Za-z0-9_:.-]{1,80}$/.test(step.marker)) {
        throw taskError(ERROR_CODES.VALIDATION, 'badMarker', { marker: step.marker });
      }
      const op = step.op || 'add';
      let count = null;
      if (step.count !== undefined) {
        count = parseStrictNumber(required(ctx, step.count, 'count'));
        if (count === null || !Number.isInteger(count)) {
          throw taskError(ERROR_CODES.VALIDATION, 'notNumber', { field: 'count' });
        }
      }
      ctx.prepare({ marker: step.marker, op, count });
      const progress = forTargets(ctx, targets, (target) => {
        const markers = parseMarkers(target.obj.get('statusmarkers'));
        const existing = markers.find((m) => m.tag === step.marker);
        const others = markers.filter((m) => m.tag !== step.marker);
        let next = existing || null;
        switch (op) {
          case 'add':
            next = existing || {
              tag: step.marker,
              count: count !== null ? clamp(count, 0, 9) : null,
            };
            break;
          case 'remove':
            next = null;
            break;
          case 'toggle':
            next = existing ? null : { tag: step.marker, count: null };
            break;
          case 'set':
            next =
              count !== null && count <= 0
                ? null
                : { tag: step.marker, count: count === null ? null : clamp(count, 1, 9) };
            break;
          case 'adjust': {
            const value = (existing?.count ?? 0) + (count ?? 1);
            next = value <= 0 ? null : { tag: step.marker, count: clamp(value, 1, 9) };
            break;
          }
        }
        writeToken(ctx, target.obj, {
          statusmarkers: formatMarkers(next ? [...others, next] : others),
        });
      });
      return { result: { changed: progress.done.length }, ...progress };
    },

    ping(step, ctx) {
      const where = locate(ctx, step);
      if (step.moveView && !hasGmAuthority$1(ctx.inst)) {
        throw taskError(ERROR_CODES.UNAUTHORIZED, 'gmOnlyMode', { mode: 'moveView' });
      }
      let visibleTo;
      if (step.to) {
        const recipients = resolveRecipients(step.to, ctx.inst);
        visibleTo = [...recipients.players, ...(recipients.gm ? gmPlayerIds() : [])];
        if (!visibleTo.length) {
          throw taskError(ERROR_CODES.MISSING_TARGET, 'noRecipients', {});
        }
      }
      ping(where.left, where.top, where.pageId, null, Boolean(step.moveView), visibleTo);
      return { result: { pinged: true } };
    },

    'effect.spawn'(step, ctx) {
      rateLimit(`effects:${ctx.inst.definitionId}`, 30);
      const where = locate(ctx, step);
      const [type, color] = String(step.fx).split('-');
      const spec = { left: where.left, top: where.top, pageId: where.pageId };
      if (FX_TYPES.includes(type) && FX_COLORS.includes(color)) {
        spec.fx = step.fx;
      } else if (['beam', 'breath', 'splatter'].includes(type) && FX_COLORS.includes(color)) {
        spec.fx = step.fx;
      } else {
        // Custom effects are GM-approved definitions only.
        if (!hasGmAuthority$1(ctx.inst)) {
          throw taskError(ERROR_CODES.UNAUTHORIZED, 'customFx', { fx: step.fx });
        }
        const custom = findObjects({ _type: 'custfx', name: step.fx })[0];
        if (!custom) {
          throw taskError(ERROR_CODES.MISSING_TARGET, 'fxMissing', { fx: step.fx });
        }
        spec.definition = custom.get('definition');
      }
      if (step.to) {
        const left = parseStrictNumber(required(ctx, step.to.left, 'to.left'));
        const top = parseStrictNumber(required(ctx, step.to.top, 'to.top'));
        if (left === null || top === null) {
          throw taskError(ERROR_CODES.VALIDATION, 'badLocation', {});
        }
        spec.to = { left, top };
      }
      spawnEffect(spec);
      return { result: { spawned: true } };
    },

    'audio.control'(step, ctx) {
      if (!hasGmAuthority$1(ctx.inst)) {
        throw taskError(ERROR_CODES.UNAUTHORIZED, 'gmOnlyAction', { type: step.type });
      }
      const name = ctx.render(step.track, (v) => v).trim();
      const track =
        getObject('jukeboxtrack', name) ||
        findObjects({ _type: 'jukeboxtrack', title: name })[0] ||
        null;
      if (!track) {
        throw taskError(ERROR_CODES.MISSING_TARGET, 'trackMissing', { track: name });
      }
      const changes = {};
      if (step.op === 'play') {
        Object.assign(changes, { playing: true, softstop: false });
        if (typeof step.loop === 'boolean') {
          changes.loop = step.loop;
        }
      } else if (step.op === 'stop') {
        Object.assign(changes, { playing: false, softstop: false });
      }
      if (step.op === 'volume' || step.volume !== undefined) {
        const volume = parseStrictNumber(required(ctx, step.volume, 'volume'));
        if (volume === null) {
          throw taskError(ERROR_CODES.VALIDATION, 'notNumber', { field: 'volume' });
        }
        changes.volume = clamp(Math.round(volume), 0, 100);
      }
      ctx.prepare({ track: track.id, changes });
      track.set(changes);
      return { result: { track: track.id, ...changes } };
    },

    'integration.command'(step, ctx) {
      if (!hasGmAuthority$1(ctx.inst)) {
        throw taskError(ERROR_CODES.UNAUTHORIZED, 'gmOnlyAction', { type: step.type });
      }
      rateLimit(`commands:${ctx.inst.definitionId}`, getLimits().chatPerMinute);
      const args = {};
      for (const [name, expr] of Object.entries(step.args || {})) {
        args[name] = required(ctx, expr, `args.${name}`);
      }
      const command = ctx.render(
        step.command,
        (value) => {
          // Exact argument encoding: only plain tokens may be inserted, so a
          // value can never add flags, commands or line breaks.
          if (!/^[A-Za-z0-9_\-.:#@+]*$/.test(value)) {
            throw taskError(ERROR_CODES.VALIDATION, 'unsafeArgument', {});
          }
          return value;
        },
        args
      );
      if (!/^![A-Za-z0-9_-]+/.test(command) || /[\r\n]/.test(command)) {
        throw taskError(ERROR_CODES.VALIDATION, 'badCommand', {});
      }
      chat(SCRIPT_NAME, command);
      // Dispatch is not proof that the other Mod did anything.
      return { result: { dispatched: true }, outcome: 'dispatched' };
    },

    'integration.call'(step, ctx) {
      const adapter = getAdapter(step.adapter);
      if (!adapter) {
        throw taskError(
          ERROR_CODES.UNAVAILABLE,
          'adapterUnavailable',
          { adapter: step.adapter },
          { transient: false }
        );
      }
      const action = adapter.actions[step.action];
      if (!action) {
        throw taskError(
          ERROR_CODES.UNAVAILABLE,
          'adapterAction',
          { adapter: step.adapter, action: step.action },
          { transient: false }
        );
      }
      if (adapter.authority !== 'any' && !hasGmAuthority$1(ctx.inst)) {
        throw taskError(ERROR_CODES.UNAUTHORIZED, 'adapterAuthority', { adapter: step.adapter });
      }
      const input = {};
      for (const [name, expr] of Object.entries(step.input || {})) {
        const value = ctx.evaluate(expr);
        input[name] = value === MISSING ? null : value;
      }
      ctx.prepare({ adapter: step.adapter, action: step.action });
      return { async: { adapter, action, input, timeoutMs: step.timeoutMs || action.timeoutMs } };
    },
  };

  /**
   * Sets an attribute, through sheet workers when asked and supported.
   *
   * @param {object} attr Roll20 attribute.
   * @param {string} field current or max.
   * @param {*} value Value.
   * @param {boolean} useWorker Trigger sheet workers.
   * @returns {void}
   */
  function setAttribute(attr, field, value, useWorker) {
    if (useWorker) {
      if (typeof attr.setWithWorker !== 'function') {
        throw taskError(ERROR_CODES.UNAVAILABLE, 'workerUnavailable', {}, { transient: false });
      }
      attr.setWithWorker({ [field]: value });
      return;
    }
    attr.set(field, value);
  }

  // Permissions (plan §10): GM checks from the real sender ID, narrowly
  // published player tasks, effect-time control checks, single-use
  // confirmation tokens for destructive operations and per-player rate limits.

  const commandWindows = new Map();

  /**
   * Returns true when a player may start a definition with the given targets.
   *
   * @param {string} playerId Real sender ID.
   * @param {object} def Definition snapshot.
   * @param {object} [bindings] Resolved bindings.
   * @returns {{ok: boolean, reason?: string}} Decision.
   */
  function canStart(playerId, def, bindings = {}) {
    if (isGm(playerId)) {
      return { ok: true };
    }
    if (!playerId || playerId === 'API') {
      return { ok: false, reason: 'apiDenied' };
    }
    const access = def.access || {};
    if (access.mode !== 'players') {
      return { ok: false, reason: 'gmOnly' };
    }
    const listed =
      Array.isArray(access.players) &&
      (access.players.includes(playerId) || access.players.includes('all'));
    const ids = Object.values(bindings).flat();
    const controlsAll =
      ids.length > 0 &&
      ids.every((id) => {
        const found = findAnyTarget(id);
        return found && playerControls(playerId, found.obj, found.type);
      });
    if (!listed && !(access.controllers && controlsAll)) {
      return { ok: false, reason: 'notShared' };
    }
    // Players may only aim the task at things they control.
    if (ids.length && !controlsAll) {
      return { ok: false, reason: 'notController' };
    }
    const maxTargets = access.capabilities?.maxTargets;
    if (Number.isInteger(maxTargets) && ids.length > maxTargets) {
      return { ok: false, reason: 'tooManyTargets' };
    }
    return { ok: true };
  }

  /**
   * Returns true when a player may inspect, pause, resume or cancel a run.
   *
   * @param {string} playerId Real sender ID.
   * @param {object} inst Instance.
   * @returns {boolean} True when allowed.
   */
  function canManageRun(playerId, inst) {
    if (isGm(playerId)) {
      return true;
    }
    return (
      Boolean(playerId) &&
      playerId !== 'API' &&
      inst.initiatorPlayerId === playerId &&
      inst.authority === 'initiator'
    );
  }

  /**
   * Checks, at effect time, that a run may still act on its targets. Player
   * runs lose authority when the player loses control; GM-service runs need
   * the definition to be enabled and published by a GM.
   *
   * @param {object} inst Instance.
   * @param {string[]} targetIds Object IDs the step will change.
   * @param {object} def Definition snapshot.
   * @returns {{ok: boolean, reason?: string, id?: string}} Decision.
   */
  function checkEffectAuthority(inst, targetIds, def) {
    if (inst.authority === 'gmService') {
      return { ok: true };
    }
    const playerId = inst.initiatorPlayerId;
    if (isGm(playerId)) {
      return { ok: true };
    }
    if (!playerId || !getObject('player', playerId)) {
      return { ok: false, reason: 'initiatorGone' };
    }
    const access = def.access || {};
    if (access.mode !== 'players') {
      return { ok: false, reason: 'publicationRevoked' };
    }
    for (const id of targetIds) {
      const found = findAnyTarget(id);
      if (found && !playerControls(playerId, found.obj, found.type)) {
        return { ok: false, reason: 'controlLost', id };
      }
    }
    return { ok: true };
  }

  /**
   * Applies the per-player command rate limit.
   *
   * @param {string} playerId Player ID.
   * @returns {boolean} True when the command may run.
   */
  function allowCommand(playerId) {
    if (isGm(playerId)) {
      return true;
    }
    const at = now();
    const window = commandWindows.get(playerId) || { start: at, count: 0 };
    if (at - window.start > 60000) {
      window.start = at;
      window.count = 0;
    }
    window.count += 1;
    commandWindows.set(playerId, window);
    return window.count <= getLimits().playerCommandsPerMinute;
  }

  /**
   * Issues a single-use confirmation token bound to the caller, the operation,
   * the IDs and their revisions.
   *
   * @param {string} playerId Caller.
   * @param {string} op Operation.
   * @param {object} payload Operation details (IDs, revisions, options).
   * @returns {string} Token.
   */
  function issueConfirmation(playerId, op, payload) {
    const s = getState();
    pruneConfirmations();
    const token = randomToken(nextTokenCounter());
    s.confirmations[token] = { playerId, op, payload, expiresAt: now() + TIMING.confirmationTtlMs };
    return token;
  }

  /**
   * Consumes a confirmation token. Expired, reused or foreign tokens fail.
   *
   * @param {string} token Token.
   * @param {string} playerId Caller.
   * @returns {{ok: boolean, op?: string, payload?: object, reason?: string}} Result.
   */
  function consumeConfirmation(token, playerId) {
    const s = getState();
    const entry = s.confirmations[token];
    if (!entry) {
      return { ok: false, reason: 'confirmationUnknown' };
    }
    delete s.confirmations[token];
    if (entry.expiresAt < now()) {
      return { ok: false, reason: 'confirmationExpired' };
    }
    if (entry.playerId !== playerId) {
      return { ok: false, reason: 'confirmationForeign' };
    }
    return { ok: true, op: entry.op, payload: entry.payload };
  }

  /**
   * Drops expired confirmations.
   *
   * @returns {void}
   */
  function pruneConfirmations() {
    const s = getState();
    const at = now();
    for (const [token, entry] of Object.entries(s.confirmations)) {
      if (entry.expiresAt < at) {
        delete s.confirmations[token];
      }
    }
  }

  // The executor (plan §4, §7, §8): admission, persistent frames, waits,
  // conditions, loops, calls, cooperative parallel branches, the action
  // journal, retries, pause/resume/cancel and review. Every continuation is a
  // scheduler job carrying generations, so cancelled or superseded work is a
  // harmless no-op when its job fires.

  const RETAIN_TERMINAL = 20;
  const JOURNAL_LIMIT = 60;

  // ---------------------------------------------------------------------------
  // Lookups
  // ---------------------------------------------------------------------------

  /**
   * Returns an instance.
   *
   * @param {string} id Run ID.
   * @returns {object|null} Instance.
   */
  function getInstance(id) {
    return getState().instances[id] || null;
  }

  /**
   * Returns instances, newest first.
   *
   * @param {(inst: object) => boolean} [filter] Filter.
   * @returns {object[]} Instances.
   */
  function listInstances(filter = () => true) {
    return Object.values(getState().instances)
      .filter(filter)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Returns the active (not finished) runs of a definition, excluding queued.
   *
   * @param {string} defId Definition ID.
   * @returns {object[]} Instances.
   */
  function activeRunsOf(defId) {
    return Object.values(getState().instances).filter(
      (i) => i.definitionId === defId && ACTIVE_STATUSES.has(i.status) && i.status !== STATUS.QUEUED
    );
  }

  /**
   * Returns the definition snapshot a run is pinned to.
   *
   * @param {object} inst Instance.
   * @returns {object|null} Snapshot.
   */
  function defOf(inst) {
    return getSnapshot(inst.definitionId, inst.definitionRevision);
  }

  /**
   * Adds a timeline entry to a run, keeping the timeline bounded.
   *
   * @param {object} inst Instance.
   * @param {string} kind Entry kind.
   * @param {object} [detail] Detail.
   * @returns {void}
   */
  function timeline(inst, kind, detail = {}) {
    inst.timeline.push({ at: now(), kind, ...detail });
    const max = getLimits().timelinePerRun;
    if (inst.timeline.length > max) {
      inst.timeline.splice(1, inst.timeline.length - max);
    }
  }

  /**
   * Asks for a dashboard refresh after a run changed.
   *
   * @param {object} inst Instance.
   * @returns {void}
   */
  function touch(inst) {
    maybeCall('dashboardDirty', 'instances', inst.id);
  }

  /**
   * Bumps a run's management revision after a status change, so links made
   * before the change are refused as stale.
   *
   * @param {object} inst Instance.
   * @returns {void}
   */
  function bump(inst) {
    inst.revision += 1;
    touch(inst);
  }

  // ---------------------------------------------------------------------------
  // Admission (plan §5 admission policies)
  // ---------------------------------------------------------------------------

  /**
   * Resolves start parameters against the definition's declarations.
   *
   * @param {object} def Definition snapshot.
   * @param {object} raw Raw parameters.
   * @returns {{ok: boolean, params?: object, error?: string, vars?: object}} Result.
   */
  function resolveParams(def, raw = {}) {
    const decls = def.parameters || {};
    const params = {};
    for (const key of Object.keys(raw)) {
      if (!decls[key]) {
        return { ok: false, error: 'unknownParam', vars: { name: key } };
      }
    }
    for (const [name, spec] of Object.entries(decls)) {
      let value = raw[name];
      if (value === undefined) {
        if (spec.default !== undefined) {
          params[name] = spec.default;
          continue;
        }
        if (spec.required) {
          return { ok: false, error: 'paramRequired', vars: { name } };
        }
        continue;
      }
      if (spec.type === 'number' && typeof value === 'string') {
        value = Number(value);
      }
      if (spec.type === 'boolean' && typeof value === 'string') {
        value = value === 'true' ? true : value === 'false' ? false : value;
      }
      const checked = checkParamValue(spec, value);
      if (!checked.ok) {
        return {
          ok: false,
          error: 'badParam',
          vars: { name, ...checked.vars, reason: checked.error },
        };
      }
      params[name] = checked.value;
    }
    return { ok: true, params };
  }

  /**
   * Admits a new run of a definition according to its concurrency policy.
   *
   * @param {string} defId Definition ID.
   * @param {object} opts Start options.
   * @param {string|null} opts.initiatorId Real player ID, or null for unattended starts.
   * @param {object} [opts.params] Resolved parameters.
   * @param {object} [opts.bindings] Resolved bindings {name: [ids]}.
   * @param {object|null} [opts.event] Normalised event snapshot.
   * @param {object} [opts.trigger] {type, id, scheduleId}.
   * @param {object|null} [opts.occurrence] {key, intendedDueAt, missedCount}.
   * @param {object|null} [opts.parent] {runId, branchId, stepId, owned}.
   * @param {number} [opts.revision] Revision to pin (current by default).
   * @param {object} [opts.correlation] {rootId, depth}.
   * @param {string|null} [opts.rerunOf] Run this one repeats.
   * @param {boolean} [opts.fromQueue] True when draining the queue.
   * @returns {{ok: boolean, status: string, instance?: object, reason?: string, vars?: object}} Result.
   */
  function admitRun(defId, opts) {
    const s = getState();
    const limits = getLimits();
    const record = getRecord(defId);
    const reject = (reason, vars = {}) => {
      count('rejected');
      diag(`admission rejected ${defId}: ${reason}`);
      return { ok: false, status: 'rejected', reason, vars };
    };
    if (runtime.disabled) {
      return reject('disabled');
    }
    if (s.halted) {
      return reject('halted');
    }
    if (!record || record.archived) {
      return reject('definitionNotFound', { id: defId });
    }
    if (!record.enabled) {
      return reject('definitionDisabled', { id: defId });
    }
    const revision = opts.revision ?? record.current;
    const def = getSnapshot(defId, revision);
    if (!def) {
      return reject('revisionMissing', { id: defId, revision });
    }
    const depth = opts.correlation?.depth ?? 0;
    if (depth > limits.ancestryDepth) {
      return reject('ancestryLimit', { max: limits.ancestryDepth });
    }
    if (opts.parent) {
      const parent = getInstance(opts.parent.runId);
      const recursion = def.policy?.recursion;
      if (
        parent &&
        parent.definitionId === defId &&
        !(recursion?.allow && depth <= recursion.maxDepth)
      ) {
        return reject('recursionLimit', {});
      }
      if (parent && countDescendants(parent.correlation.rootId) >= limits.descendantsPerRun) {
        return reject('descendantLimit', { max: limits.descendantsPerRun });
      }
    }
    const active = Object.values(s.instances).filter((i) => ACTIVE_STATUSES.has(i.status)).length;
    if (active >= limits.activeInstances) {
      return reject('tooManyRuns', { max: limits.activeInstances });
    }
    if (stateNearlyFull(now())) {
      return reject('stateFull', {});
    }
    if (!opts.fromQueue && !checkCircuit(defId, def)) {
      return reject('circuitOpen', { id: defId });
    }
    const policy = def.policy || {};
    const mode = policy.concurrency || 'skipIfRunning';
    const running = activeRunsOf(defId);
    const max = policy.maxConcurrent ?? (mode === 'allow' ? 5 : 1);
    if (running.length >= max && !opts.parent) {
      if (mode === 'skipIfRunning') {
        count('suppressed');
        return { ok: false, status: 'skipped', reason: 'alreadyRunning', vars: { id: defId } };
      }
      if (mode === 'allow') {
        return reject('concurrencyLimit', { max });
      }
      if (mode === 'queue') {
        return enqueue(defId, def, opts);
      }
      if (mode === 'replace') {
        for (const inst of running) {
          cancelRun(inst.id, null, 'replaced');
        }
      }
    }
    const instance = createInstance(def, revision, opts);
    return { ok: true, status: 'started', instance };
  }

  /**
   * Counts the runs started from one root run.
   *
   * @param {string} rootId Root run ID.
   * @returns {number} Count.
   */
  function countDescendants(rootId) {
    return Object.values(getState().instances).filter(
      (i) => i.correlation?.rootId === rootId && i.id !== rootId
    ).length;
  }

  /**
   * Applies the per-definition circuit breaker: too many admissions in a
   * minute disable the definition and raise an incident.
   *
   * @param {string} defId Definition ID.
   * @param {object} def Definition snapshot.
   * @returns {boolean} True when the admission may proceed.
   */
  function checkCircuit(defId, def) {
    const s = getState();
    const at = now();
    const max = def.policy?.circuit?.admissionsPerMinute ?? getLimits().admissionsPerMinute;
    const window = s.circuit[defId] || { start: at, count: 0 };
    if (at - window.start > 60000) {
      window.start = at;
      window.count = 0;
    }
    window.count += 1;
    s.circuit[defId] = window;
    if (window.count > max) {
      setEnabled(defId, false, null, { reason: 'circuit' });
      createIncident({
        kind: 'circuit',
        cause: 'circuitBreaker',
        definitionId: defId,
        count: window.count,
        range: { from: window.start, to: at },
      });
      maybeCall('notifyGm', 'circuit', { id: defId, count: window.count });
      return false;
    }
    return true;
  }

  /**
   * Adds an admission to a definition's queue. Parameters and targets are
   * pinned now, not taken from later selection.
   *
   * @param {string} defId Definition ID.
   * @param {object} def Definition snapshot.
   * @param {object} opts Start options.
   * @returns {object} Admission result.
   */
  function enqueue(defId, def, opts) {
    const s = getState();
    const queue = s.queues[defId] || (s.queues[defId] = []);
    const max = Math.min(def.policy?.maxQueue ?? 10, getLimits().queuedPerDefinition);
    if (queue.length >= max) {
      count('rejected');
      createIncident({ kind: 'missed', cause: 'queueFull', definitionId: defId, count: 1 });
      return { ok: false, status: 'rejected', reason: 'queueFull', vars: { max } };
    }
    const at = now();
    const entry = {
      id: nextId('queued'),
      definitionId: defId,
      revision: opts.revision ?? getRecord(defId).current,
      admittedAt: at,
      expiresAt: def.policy?.queueExpiryMs ? at + def.policy.queueExpiryMs : null,
      opts: clone({ ...opts, fromQueue: true }),
    };
    queue.push(entry);
    if (entry.expiresAt) {
      schedule({
        kind: JOB.QUEUE_EXPIRY,
        dueAt: entry.expiresAt,
        key: `queue:${entry.id}`,
        target: { defId, entryId: entry.id },
      });
    }
    audit('run.queue', { definition: defId, entry: entry.id });
    maybeCall('dashboardDirty', 'queue');
    return { ok: true, status: 'queued', entry };
  }

  /**
   * Starts the next queued admission of a definition when there is room.
   *
   * @param {string} defId Definition ID.
   * @returns {void}
   */
  function drainQueue(defId) {
    const s = getState();
    const queue = s.queues[defId];
    if (!queue?.length) {
      return;
    }
    const def = getSnapshot(defId);
    const max = def?.policy?.maxConcurrent ?? 1;
    while (queue.length && activeRunsOf(defId).length < max) {
      const entry = queue.shift();
      runtime.scheduler?.cancelKey(`queue:${entry.id}`);
      if (entry.expiresAt && entry.expiresAt < now()) {
        createIncident({
          kind: 'missed',
          cause: 'expiredQueue',
          definitionId: defId,
          count: 1,
          range: { from: entry.admittedAt, to: entry.expiresAt },
        });
        continue;
      }
      const result = admitRun(defId, entry.opts);
      if (!result.ok && result.status === 'rejected') {
        createIncident({
          kind: 'missed',
          cause: 'queueRejected',
          definitionId: defId,
          count: 1,
          evidence: result.reason,
        });
      }
    }
    if (!queue.length) {
      delete s.queues[defId];
    }
    maybeCall('dashboardDirty', 'queue');
  }

  /**
   * Drops an expired queue entry (job handler).
   *
   * @param {object} job Job.
   * @returns {void}
   */
  function onQueueExpiry(job) {
    const s = getState();
    const queue = s.queues[job.target.defId] || [];
    const index = queue.findIndex((e) => e.id === job.target.entryId);
    if (index >= 0) {
      const [entry] = queue.splice(index, 1);
      createIncident({
        kind: 'missed',
        cause: 'expiredQueue',
        definitionId: entry.definitionId,
        count: 1,
        range: { from: entry.admittedAt, to: entry.expiresAt },
      });
      maybeCall('dashboardDirty', 'queue');
    }
  }

  /**
   * Creates and starts a run.
   *
   * @param {object} def Definition snapshot.
   * @param {number} revision Pinned revision.
   * @param {object} opts Start options.
   * @returns {object} Instance.
   */
  function createInstance(def, revision, opts) {
    const s = getState();
    const at = now();
    const id = nextId('run');
    const parent = opts.parent ? getInstance(opts.parent.runId) : null;
    const inst = {
      id,
      revision: 1,
      generation: 1,
      definitionId: def.id,
      definitionRevision: revision,
      name: def.name,
      status: STATUS.RUNNING,
      initiatorPlayerId: opts.initiatorId || null,
      authority: def.access?.authority === 'gmService' ? 'gmService' : 'initiator',
      params: clone(opts.params || {}),
      bindings: clone(opts.bindings || {}),
      event: opts.event ? clone(opts.event) : null,
      trigger: opts.trigger || { type: 'manual', id: 'manual' },
      occurrence: opts.occurrence || null,
      parentId: parent?.id || null,
      parentBranchId: opts.parent?.branchId || null,
      parentStepId: opts.parent?.stepId || null,
      owned: Boolean(opts.parent?.owned),
      children: [],
      correlation: {
        rootId: parent?.correlation.rootId || id,
        depth: opts.correlation?.depth ?? (parent ? parent.correlation.depth + 1 : 0),
      },
      rerunOf: opts.rerunOf || null,
      createdAt: at,
      startedAt: at,
      completedAt: null,
      intendedDueAt: opts.occurrence?.intendedDueAt ?? null,
      latenessMs: opts.occurrence?.intendedDueAt
        ? Math.max(0, at - opts.occurrence.intendedDueAt)
        : 0,
      branches: { main: newBranch('main', null, null, 'root', {}) },
      nextBranch: 1,
      journal: {},
      timeline: [],
      pause: null,
      review: null,
      outcome: null,
      error: null,
      effects: 0,
      bootId: runtime.bootId,
    };
    s.instances[id] = inst;
    if (parent) {
      parent.children.push(id);
    }
    timeline(inst, 'start', {
      trigger: inst.trigger.type,
      by: inst.initiatorPlayerId || 'gmService',
    });
    count('admitted');
    audit('run.start', {
      run: id,
      definition: def.id,
      revision,
      by: inst.initiatorPlayerId,
      trigger: inst.trigger.type,
    });
    const policy = def.policy || {};
    if (policy.timeoutMs) {
      schedule({
        kind: JOB.CONTINUE,
        dueAt: at + policy.timeoutMs,
        key: `life:${id}`,
        target: { runId: id, lifetime: 'timeout', gen: inst.generation },
      });
    } else if (policy.lifetimeMs) {
      schedule({
        kind: JOB.CONTINUE,
        dueAt: at + policy.lifetimeMs,
        key: `life:${id}`,
        target: { runId: id, lifetime: 'expire', gen: inst.generation },
      });
    }
    emitTaskEvent(inst, 'task.started');
    scheduleBranch(inst, inst.branches.main, at);
    maybeCall('dashboardDirty', 'instances');
    return inst;
  }

  /**
   * Creates a branch record.
   *
   * @param {string} id Branch ID.
   * @param {string|null} parentId Parent branch.
   * @param {string|null} stepId Parallel step that spawned it.
   * @param {string} block Starting block key.
   * @param {object} variables Copy-on-start variables.
   * @param {string} [label] Display label.
   * @returns {object} Branch.
   */
  function newBranch(id, parentId, stepId, block, variables, label) {
    return {
      id,
      label: label || id,
      parentId,
      stepId,
      status: 'running',
      frames: [{ block, index: 0 }],
      variables,
      wait: null,
      gen: 1,
      consecutive: 0,
      attempts: {},
      error: null,
    };
  }

  // ---------------------------------------------------------------------------
  // Jobs
  // ---------------------------------------------------------------------------

  /**
   * Schedules a branch continuation.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {number} dueAt When.
   * @param {string} [kind] Job kind.
   * @returns {void}
   */
  function scheduleBranch(inst, branch, dueAt, kind = JOB.CONTINUE) {
    schedule({
      kind,
      dueAt,
      key: `run:${inst.id}:${branch.id}`,
      target: { runId: inst.id, branchId: branch.id, gen: inst.generation, bgen: branch.gen },
    });
  }

  /**
   * Cancels every job of a run.
   *
   * @param {object} inst Instance.
   * @param {boolean} [includeLifetime=false] Also cancel the run timeout.
   * @returns {void}
   */
  function cancelJobs(inst, includeLifetime = false) {
    runtime.scheduler?.cancelWhere(
      (job) =>
        job.target?.runId === inst.id && (includeLifetime || !String(job.key).startsWith('life:'))
    );
  }

  /**
   * Returns the branch a job targets when the job is still current.
   *
   * @param {object} job Job.
   * @returns {{inst: object, branch: object}|null} Live target.
   */
  function liveTarget(job) {
    const inst = getInstance(job.target.runId);
    if (!inst || inst.generation !== job.target.gen) {
      return null;
    }
    const branch = inst.branches[job.target.branchId];
    if (!branch || branch.gen !== job.target.bgen) {
      return null;
    }
    return { inst, branch };
  }

  /**
   * Handles continuation, retry and wait-expiry jobs.
   *
   * @param {object} job Job.
   * @returns {void}
   */
  function onContinueJob(job) {
    if (job.target.lifetime) {
      const inst = getInstance(job.target.runId);
      if (inst && ACTIVE_STATUSES.has(inst.status)) {
        if (job.target.lifetime === 'timeout') {
          finalize(
            inst,
            STATUS.FAILED,
            errorRecord(taskError(ERROR_CODES.TIMEOUT, 'runTimeout', {}))
          );
        } else {
          finalize(
            inst,
            STATUS.EXPIRED,
            errorRecord(taskError(ERROR_CODES.TIMEOUT, 'runExpired', {}))
          );
        }
      }
      return;
    }
    const live = liveTarget(job);
    if (!live) {
      return;
    }
    const { inst, branch } = live;
    if (inst.status !== STATUS.RUNNING && inst.status !== STATUS.WAITING) {
      return;
    }
    const wait = branch.wait;
    if (wait?.kind === 'time') {
      const lateness = now() - wait.dueAt;
      if (wait.dueAt > now()) {
        // A clock moved backwards: wait for the real deadline.
        scheduleBranch(inst, branch, wait.dueAt);
        return;
      }
      branch.wait = null;
      branch.status = 'running';
      if (lateness > lateWindow(inst)) {
        if (!applyWaitOverdue(inst, branch, wait, lateness)) {
          return;
        }
      }
    } else if (wait?.kind === 'retry' || wait?.kind === 'yield') {
      branch.wait = null;
      branch.status = 'running';
    } else if (wait?.kind === 'child' || wait?.kind === 'join' || wait?.kind === 'async') {
      if (!wait.completion) {
        return;
      }
      branch.wait = null;
      branch.status = 'running';
      if (wait.kind === 'async' && !finishAsync(inst, branch, wait)) {
        return;
      }
      if (wait.kind === 'child' && !finishChildWait(inst, branch, wait)) {
        return;
      }
    } else if (wait) {
      return;
    }
    inst.status = STATUS.RUNNING;
    runBranch(inst, branch);
  }

  /**
   * Returns the lateness window after which overdue policy applies.
   *
   * @param {object} inst Instance.
   * @returns {number} Milliseconds.
   */
  function lateWindow(inst) {
    return defOf(inst)?.policy?.overdue?.windowMs ?? getConfig().lateWindowMs;
  }

  /**
   * Applies the overdue policy to a wait that ended much later than due
   * (typically after the sandbox was off).
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} wait Expired wait.
   * @param {number} lateness Milliseconds late.
   * @returns {boolean} True when the branch should continue now.
   */
  function applyWaitOverdue(inst, branch, wait, lateness) {
    const policyMode = defOf(inst)?.policy?.overdue?.mode;
    const mode = wait.overdue || { review: 'review', expire: 'expire' }[policyMode] || 'continue';
    timeline(inst, 'late', { stepId: wait.stepId, latenessMs: lateness, mode });
    if (mode === 'review') {
      enterReview(inst, branch, 'overdueWait', {
        stepId: wait.stepId,
        latenessMs: lateness,
        indexAdvanced: true,
      });
      return false;
    }
    if (mode === 'expire') {
      finalize(
        inst,
        STATUS.EXPIRED,
        errorRecord(
          taskError(ERROR_CODES.TIMEOUT, 'overdueExpired', { latenessMs: lateness }),
          wait.stepId
        )
      );
      return false;
    }
    if (mode === 'skipNext') {
      const frame = branch.frames.at(-1);
      if (frame) {
        frame.index += 1;
      }
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Running steps
  // ---------------------------------------------------------------------------

  /**
   * Runs a branch until it suspends, finishes or uses up its job budget.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @returns {void}
   */
  function runBranch(inst, branch) {
    const compiled = getCompiled(inst.definitionId, inst.definitionRevision);
    if (!compiled) {
      finalize(
        inst,
        STATUS.FAILED,
        errorRecord(taskError(ERROR_CODES.VALIDATION, 'revisionMissing', { id: inst.definitionId }))
      );
      return;
    }
    const limits = getLimits();
    let steps = 0;
    while (branch.status === 'running' && inst.status === STATUS.RUNNING) {
      if (steps >= limits.stepsPerJob) {
        // Bounded yield: let other due work run, then carry on.
        branch.wait = { kind: 'yield' };
        branch.status = 'waiting';
        scheduleBranch(inst, branch, now() + 10);
        return;
      }
      const frame = branch.frames.at(-1);
      if (!frame) {
        completeBranch(inst, branch);
        return;
      }
      const block = compiled.blocks.get(frame.block) || [];
      if (frame.index >= block.length) {
        popFrame(inst, branch, compiled);
        steps += 1;
        continue;
      }
      branch.consecutive += 1;
      if (branch.consecutive > limits.consecutiveSteps) {
        failBranch(
          inst,
          branch,
          errorRecord(
            taskError(ERROR_CODES.RUNAWAY, 'runaway', { max: limits.consecutiveSteps }),
            block[frame.index].id
          )
        );
        return;
      }
      const step = block[frame.index];
      let outcome;
      try {
        outcome = execStep(inst, branch, frame, step);
      } catch (err) {
        outcome = handleStepError(inst, branch, step, err, false);
      }
      steps += 1;
      if (outcome === 'next') {
        frame.index += 1;
      } else if (outcome === 'suspend' || outcome === 'stop') {
        return;
      }
    }
  }

  /**
   * Leaves a finished block: loops decide whether to go round again; other
   * compound steps simply continue after themselves.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} compiled Compiled program.
   * @returns {void}
   */
  function popFrame(inst, branch, compiled) {
    const frame = branch.frames.pop();
    const parent = branch.frames.at(-1);
    if (!parent || !frame.owner) {
      return;
    }
    const owner = compiled.steps.get(frame.owner)?.step;
    if (owner?.type === 'loop') {
      const next = loopContinues(inst, branch, owner, frame);
      if (next) {
        branch.frames.push({
          block: frame.block,
          index: 0,
          owner: frame.owner,
          loop: { ...frame.loop, iteration: frame.loop.iteration + 1 },
        });
        return;
      }
    }
    parent.index += 1;
  }

  /**
   * Decides whether a loop runs another iteration.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} step Loop step.
   * @param {object} frame Finished iteration frame.
   * @returns {boolean} True to iterate again.
   */
  function loopContinues(inst, branch, step, frame) {
    const done = frame.loop.iteration;
    const cap =
      step.mode === 'forever'
        ? Infinity
        : Math.min(step.maxIterations ?? getLimits().loopIterations, getLimits().loopIterations);
    if (done >= cap) {
      if (step.mode === 'while' || step.mode === 'until') {
        timeline(inst, 'loopCap', { stepId: step.id, iterations: done });
      }
      return false;
    }
    switch (step.mode) {
      case 'count':
        return done < frame.loop.count;
      case 'while':
        return truthy(evalExpr(inst, branch, step.condition));
      case 'until':
        return !truthy(evalExpr(inst, branch, step.condition));
      case 'forever':
        return true;
      default:
        return false;
    }
  }

  /**
   * Executes one step.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} frame Current frame.
   * @param {object} step Step.
   * @returns {'next'|'pushed'|'suspend'|'stop'} What happens next.
   */
  function execStep(inst, branch, frame, step) {
    switch (step.type) {
      case 'wait':
        return execWait(inst, branch, frame, step);
      case 'awaitEvent':
        return execAwait(inst, branch, frame, step);
      case 'if': {
        const value = evalExpr(inst, branch, step.condition);
        const choice = truthy(value) ? 'then' : 'else';
        timeline(inst, 'if', { stepId: step.id, choice, missing: value === MISSING || undefined });
        const list = step[choice] || [];
        if (!list.length) {
          return 'next';
        }
        // The chosen branch is stored in the frame, so a restart resumes it.
        branch.frames.push({ block: `${step.id}/${choice}`, index: 0, owner: step.id, choice });
        return 'pushed';
      }
      case 'loop':
        return execLoop(inst, branch, step);
      case 'call':
        return execCall(inst, branch, frame, step);
      case 'parallel':
        return execParallel(inst, branch, frame, step);
      case 'stop': {
        const message = step.message ? render(inst, branch, step.message, (v) => v) : null;
        const outcome = step.outcome || 'completed';
        const status = {
          completed: STATUS.COMPLETED,
          failed: STATUS.FAILED,
          cancelled: STATUS.CANCELLED,
        }[outcome];
        finalize(
          inst,
          status,
          outcome === 'completed'
            ? null
            : {
                code: 'stopped',
                reason: 'stopStep',
                vars: { message: truncate(message || '', 200) },
                stepId: step.id,
              }
        );
        return 'stop';
      }
      case 'variable.set': {
        const value = evalExpr(inst, branch, step.value);
        branch.variables[step.name] = value === MISSING ? null : clone(value);
        return 'next';
      }
      case 'event.emit': {
        const value = step.value === undefined ? null : evalExpr(inst, branch, step.value);
        call('emitEvent', {
          type: 'signal',
          name: step.signal,
          value: value === MISSING ? null : value,
          source: 'internal',
          correlation: {
            runId: inst.id,
            rootId: inst.correlation.rootId,
            depth: inst.correlation.depth + 1,
          },
        });
        return 'next';
      }
      case 'task.start':
        return execTaskStart(inst, branch, step);
      case 'task.cancel':
      case 'task.pause':
        return execTaskControl(inst, branch, step);
      default:
        return execAction(inst, branch, frame, step);
    }
  }

  /**
   * Suspends a branch for a duration or until a moment.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} frame Frame.
   * @param {object} step Wait step.
   * @returns {'suspend'} Always suspends.
   */
  function execWait(inst, branch, frame, step) {
    const at = now();
    let dueAt;
    let absolute = false;
    if (step.durationMs !== undefined) {
      const raw = evalExpr(inst, branch, step.durationMs);
      const ms = typeof raw === 'number' ? raw : durationValue(raw);
      if (ms === null || !Number.isFinite(ms) || ms < 0) {
        throw taskError(ERROR_CODES.VALIDATION, 'badDuration', {});
      }
      dueAt = at + Math.max(ms, getLimits().minWaitMs);
    } else {
      const raw = evalExpr(inst, branch, step.until);
      dueAt = typeof raw === 'number' ? raw : parseIsoInstant(raw);
      if (!Number.isFinite(dueAt)) {
        throw taskError(ERROR_CODES.VALIDATION, 'badInstant', {});
      }
      absolute = true;
    }
    frame.index += 1;
    branch.consecutive = 0;
    branch.gen += 1;
    branch.wait = { kind: 'time', dueAt, stepId: step.id, absolute, overdue: step.overdue || null };
    branch.status = 'waiting';
    inst.status = anyRunning(inst) ? STATUS.RUNNING : STATUS.WAITING;
    scheduleBranch(inst, branch, dueAt);
    touch(inst);
    return 'suspend';
  }

  /**
   * Registers an awaited event with a mandatory timeout.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} frame Frame.
   * @param {object} step awaitEvent step.
   * @returns {'suspend'} Always suspends.
   */
  function execAwait(inst, branch, frame, step) {
    const at = now();
    frame.index += 1;
    branch.consecutive = 0;
    branch.gen += 1;
    branch.wait = {
      kind: 'event',
      event: step.event,
      filter: step.filter || {},
      stepId: step.id,
      saveAs: step.saveAs || step.id,
      registeredAt: at,
      timeoutAt: at + step.timeoutMs,
    };
    branch.status = 'waiting';
    inst.status = anyRunning(inst) ? STATUS.RUNNING : STATUS.WAITING;
    // Registration is saved before any further event is processed.
    maybeCall('awaitsChanged');
    schedule({
      kind: JOB.AWAIT_TIMEOUT,
      dueAt: branch.wait.timeoutAt,
      key: `await:${inst.id}:${branch.id}`,
      target: { runId: inst.id, branchId: branch.id, gen: inst.generation, bgen: branch.gen },
    });
    touch(inst);
    return 'suspend';
  }

  /**
   * Starts a loop.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} step Loop step.
   * @returns {'next'|'pushed'} Outcome.
   */
  function execLoop(inst, branch, step) {
    let total = null;
    if (step.mode === 'count') {
      const raw = evalExpr(inst, branch, step.count);
      total = typeof raw === 'number' && Number.isInteger(raw) ? raw : Number.NaN;
      if (!Number.isInteger(total) || total < 0) {
        throw taskError(ERROR_CODES.VALIDATION, 'badCount', {});
      }
      total = Math.min(total, getLimits().loopIterations);
      if (total === 0) {
        return 'next';
      }
    }
    if (step.mode === 'while' && !truthy(evalExpr(inst, branch, step.condition))) {
      return 'next';
    }
    branch.frames.push({
      block: `${step.id}/steps`,
      index: 0,
      owner: step.id,
      loop: { iteration: 1, count: total },
    });
    return 'pushed';
  }

  /**
   * Calls another definition as a child run.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} frame Frame.
   * @param {object} step Call step.
   * @returns {'next'|'suspend'} Outcome.
   */
  function execCall(inst, branch, frame, step) {
    const awaitChild = step.await !== false;
    if (!awaitChild && !hasGmAuthority(inst)) {
      throw taskError(ERROR_CODES.UNAUTHORIZED, 'detachNeedsGm', {});
    }
    const child = startChild(inst, branch, step, awaitChild);
    if (!awaitChild) {
      branch.variables[step.saveAs || step.id] = { runId: child.id };
      return 'next';
    }
    frame.index += 1;
    branch.gen += 1;
    branch.wait = {
      kind: 'child',
      childId: child.id,
      stepId: step.id,
      saveAs: step.saveAs || step.id,
      onChildFail: step.onChildFail || 'fail',
    };
    branch.status = 'waiting';
    branch.consecutive = 0;
    inst.status = anyRunning(inst) ? STATUS.RUNNING : STATUS.WAITING;
    touch(inst);
    return 'suspend';
  }

  /**
   * Admits a child run with mapped parameters and targets.
   *
   * @param {object} inst Parent instance.
   * @param {object} branch Parent branch.
   * @param {object} step call or task.start step.
   * @param {boolean} owned Whether the parent owns (and awaits) it.
   * @returns {object} Child instance.
   */
  function startChild(inst, branch, step, owned) {
    const childDef = getSnapshot(step.definition, step.revision);
    if (!childDef) {
      throw taskError(ERROR_CODES.MISSING_TARGET, 'definitionMissing', { id: step.definition });
    }
    const params = {};
    for (const [name, expr] of Object.entries(step.params || {})) {
      const value = evalExpr(inst, branch, expr);
      if (value !== MISSING) {
        params[name] = value;
      }
    }
    const resolved = resolveParams(childDef, params);
    if (!resolved.ok) {
      throw taskError(ERROR_CODES.VALIDATION, resolved.error, resolved.vars);
    }
    const bindings = {};
    for (const [name, spec] of Object.entries(step.bindings || {})) {
      bindings[name] = resolveTargets(
        inst,
        branch,
        spec,
        childDef.bindings?.[name]?.objectType || 'graphic'
      ).map((t) => t.id);
    }
    const result = admitRun(step.definition, {
      initiatorId: inst.initiatorPlayerId,
      params: resolved.params,
      bindings,
      event: inst.event,
      trigger: { type: 'call', id: step.id },
      parent: { runId: inst.id, branchId: branch.id, stepId: step.id, owned },
      revision: step.revision,
      correlation: { depth: inst.correlation.depth + 1 },
    });
    if (!result.ok || !result.instance) {
      throw taskError(
        ERROR_CODES.RESOURCE_LIMIT,
        'childRejected',
        { id: step.definition, reason: result.reason || result.status },
        { transient: false }
      );
    }
    timeline(inst, 'call', { stepId: step.id, child: result.instance.id });
    return result.instance;
  }

  /**
   * Starts a detached run (`task.start`).
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} step Step.
   * @returns {'next'} Outcome.
   */
  function execTaskStart(inst, branch, step) {
    const child = startChild(inst, branch, step, false);
    if (step.saveAs) {
      branch.variables[step.saveAs] = child.id;
    }
    return 'next';
  }

  /**
   * Cancels or pauses child runs, or another run with GM authority.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} step Step.
   * @returns {'next'} Outcome.
   */
  function execTaskControl(inst, branch, step) {
    let ids;
    if ((step.scope || 'children') === 'children') {
      ids = inst.children;
    } else {
      const raw = evalExpr(inst, branch, step.run);
      ids = (Array.isArray(raw) ? raw : [raw]).filter((x) => typeof x === 'string');
      for (const id of ids) {
        const target = getInstance(id);
        const descendant = target && target.correlation.rootId === inst.correlation.rootId;
        if (target && !descendant && !hasGmAuthority(inst)) {
          throw taskError(ERROR_CODES.UNAUTHORIZED, 'runNotOwned', { id });
        }
      }
    }
    for (const id of ids) {
      const target = getInstance(id);
      if (!target || !ACTIVE_STATUSES.has(target.status) || id === inst.id) {
        continue;
      }
      if (step.type === 'task.cancel') {
        cancelRun(id, null, 'cancelledByTask');
      } else {
        pauseRun(id, null);
      }
    }
    return 'next';
  }

  /**
   * Spawns cooperative parallel branches and waits for their join.
   *
   * @param {object} inst Instance.
   * @param {object} branch Parent branch.
   * @param {object} frame Frame.
   * @param {object} step Parallel step.
   * @returns {'suspend'} Always suspends.
   */
  function execParallel(inst, branch, frame, step) {
    const activeBranches = Object.values(inst.branches).filter(
      (b) => b.status === 'running' || b.status === 'waiting'
    ).length;
    if (activeBranches + step.branches.length > getLimits().branchesPerRun + 1) {
      throw taskError(
        ERROR_CODES.RESOURCE_LIMIT,
        'tooManyBranches',
        { max: getLimits().branchesPerRun },
        { transient: false }
      );
    }
    const children = [];
    for (const spec of step.branches) {
      const id = `b${inst.nextBranch++}`;
      const child = newBranch(
        id,
        branch.id,
        step.id,
        `${step.id}/branch/${spec.id}`,
        clone(branch.variables),
        spec.id
      );
      inst.branches[id] = child;
      children.push(id);
    }
    frame.index += 1;
    branch.gen += 1;
    branch.wait = {
      kind: 'join',
      stepId: step.id,
      join: step.join,
      children,
      cancelLosers: step.cancelLosers !== false,
    };
    branch.status = 'waiting';
    branch.consecutive = 0;
    timeline(inst, 'parallel', { stepId: step.id, branches: children.length });
    for (const id of children) {
      scheduleBranch(inst, inst.branches[id], now());
    }
    touch(inst);
    return 'suspend';
  }

  /**
   * Runs an action step through the journal.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} frame Frame.
   * @param {object} step Action step.
   * @returns {'next'|'suspend'} Outcome.
   */
  function execAction(inst, branch, frame, step) {
    const impl = ACTIONS[step.type];
    if (!impl) {
      throw taskError(
        ERROR_CODES.UNAVAILABLE,
        'unknownAction',
        { type: step.type },
        { transient: false }
      );
    }
    const def = defOf(inst);
    const attempt = branch.attempts[step.id] || 1;
    const key = journalKey(branch, step, attempt);
    const replay = replayClass(step);
    const journaled = replay !== REPLAY.PURE && replay !== REPLAY.INTERNAL;
    const entry = inst.journal[key] || null;
    if (journaled && !entry) {
      inst.journal[key] = {
        status: 'prepared',
        at: now(),
        stepId: step.id,
        branchId: branch.id,
        attempt,
        replay,
        data: {},
      };
      pruneJournal(inst);
    }
    const ctx = actionContext(inst, branch, step, def, key);
    const res = impl(step, ctx);
    if (res.async) {
      return startAsync(inst, branch, frame, step, key, res.async);
    }
    if (res.partial) {
      // Bounded chunk: remember progress, yield, then run this step again.
      inst.journal[key].progress = res.done;
      branch.wait = { kind: 'yield' };
      branch.status = 'waiting';
      scheduleBranch(inst, branch, now() + 10);
      return 'suspend';
    }
    if (journaled) {
      const record = inst.journal[key];
      record.status = res.outcome === 'dispatched' ? 'dispatched' : 'confirmed';
      record.completedAt = now();
      record.result = compactResult(res.result);
      inst.effects += 1;
    }
    if (step.saveAs) {
      branch.variables[step.saveAs] = res.result === undefined ? null : clone(res.result);
    }
    delete branch.attempts[step.id];
    return 'next';
  }

  /**
   * Shrinks a result for storage.
   *
   * @param {*} result Result.
   * @returns {*} Compact result.
   */
  function compactResult(result) {
    const text = JSON.stringify(result ?? null);
    return text.length > 500 ? { truncated: true } : (result ?? null);
  }

  /**
   * Builds the journal key for an action attempt:
   * `branch/step/iterationPath/attempt`.
   *
   * @param {object} branch Branch.
   * @param {object} step Step.
   * @param {number} attempt Attempt number.
   * @returns {string} Key.
   */
  function journalKey(branch, step, attempt) {
    const path =
      branch.frames
        .filter((f) => f.loop)
        .map((f) => f.loop.iteration)
        .join('.') || '0';
    return `${branch.id}/${step.id}/${path}/${attempt}`;
  }

  /**
   * Keeps the journal bounded, dropping the oldest settled entries.
   *
   * @param {object} inst Instance.
   * @returns {void}
   */
  function pruneJournal(inst) {
    const keys = Object.keys(inst.journal);
    if (keys.length <= JOURNAL_LIMIT) {
      return;
    }
    const settled = keys
      .filter((k) =>
        ['confirmed', 'dispatched', 'skipped', 'failed'].includes(inst.journal[k].status)
      )
      .sort((a, b) => inst.journal[a].at - inst.journal[b].at);
    for (const k of settled.slice(0, keys.length - JOURNAL_LIMIT)) {
      delete inst.journal[k];
    }
  }

  /**
   * Builds the context an action uses.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} step Step.
   * @param {object} def Definition snapshot.
   * @param {string} key Journal key.
   * @returns {object} Context.
   */
  function actionContext(inst, branch, step, def, key) {
    return {
      inst,
      def,
      progress: inst.journal[key]?.progress || [],
      evaluate: (expr) => evalExpr(inst, branch, expr),
      render: (template, sanitise, args) => render(inst, branch, template, sanitise, args),
      targets: (spec, type) => {
        const list = resolveTargets(inst, branch, spec, type);
        if (!list.length) {
          throw taskError(ERROR_CODES.MISSING_TARGET, 'noTargets', { stepId: step.id });
        }
        return list;
      },
      authorise: (ids) => {
        const decision = checkEffectAuthority(inst, ids, def);
        if (!decision.ok) {
          throw taskError(ERROR_CODES.UNAUTHORIZED, decision.reason, { id: decision.id || '' });
        }
      },
      prepare: (data) => {
        if (inst.journal[key]) {
          inst.journal[key].data = { ...inst.journal[key].data, ...clone(data) };
        }
      },
      emit: (event) =>
        call('emitEvent', {
          ...event,
          source: 'internal',
          correlation: {
            runId: inst.id,
            rootId: inst.correlation.rootId,
            depth: inst.correlation.depth + 1,
          },
        }),
      noteWrite: (objectId, changes) => maybeCall('noteOwnWrite', objectId, changes),
    };
  }

  // ---------------------------------------------------------------------------
  // Asynchronous actions
  // ---------------------------------------------------------------------------

  /**
   * Starts an asynchronous adapter call and suspends the branch.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} frame Frame.
   * @param {object} step Step.
   * @param {string} key Journal key.
   * @param {object} op {adapter, action, input, timeoutMs}.
   * @returns {'suspend'} Always suspends.
   */
  function startAsync(inst, branch, frame, step, key, op) {
    const at = now();
    const opId = `${inst.id}/${key}`;
    frame.index += 1;
    branch.gen += 1;
    branch.consecutive = 0;
    branch.wait = {
      kind: 'async',
      opId,
      key,
      stepId: step.id,
      saveAs: step.saveAs || null,
      adapter: op.adapter.name,
      action: step.action,
      timeoutAt: at + (op.timeoutMs || 30000),
      bootId: runtime.bootId,
      completion: null,
    };
    branch.status = 'waiting';
    inst.status = anyRunning(inst) ? STATUS.RUNNING : STATUS.WAITING;
    inst.journal[key].status = 'dispatched';
    schedule({
      kind: JOB.ASYNC_TIMEOUT,
      dueAt: branch.wait.timeoutAt,
      key: `async:${inst.id}:${branch.id}`,
      target: { runId: inst.id, branchId: branch.id, gen: inst.generation, bgen: branch.gen, opId },
    });
    const bootId = runtime.bootId;
    let called = false;
    const done = (err, result) => {
      if (called) {
        return;
      }
      called = true;
      asyncComplete(inst.id, branch.id, opId, bootId, err, result);
    };
    try {
      op.action.invoke(clone(op.input), { idempotencyKey: key, runId: inst.id, opId }, done);
    } catch (err) {
      done(err);
    }
    touch(inst);
    return 'suspend';
  }

  /**
   * Receives an adapter callback. Callbacks from an earlier boot, a cancelled
   * run or a superseded attempt are ignored.
   *
   * @param {string} runId Run ID.
   * @param {string} branchId Branch ID.
   * @param {string} opId Operation ID.
   * @param {string} bootId Boot that issued the call.
   * @param {*} err Error, if any.
   * @param {*} result Result.
   * @returns {void}
   */
  function asyncComplete(runId, branchId, opId, bootId, err, result) {
    if (bootId !== runtime.bootId) {
      return;
    }
    const inst = getInstance(runId);
    const branch = inst?.branches[branchId];
    if (
      !inst ||
      !branch ||
      branch.wait?.kind !== 'async' ||
      branch.wait.opId !== opId ||
      TERMINAL_STATUSES.has(inst.status)
    ) {
      return;
    }
    runtime.scheduler?.cancelKey(`async:${runId}:${branchId}`);
    branch.wait.completion = {
      ok: !err,
      error: err ? truncate(String(err?.message || err), 200) : null,
      uncertain: Boolean(err?.uncertain),
      result: compactResult(result),
    };
    if (inst.status === STATUS.PAUSED || inst.status === STATUS.REVIEW) {
      // Recorded while paused; the run advances on resume.
      return;
    }
    scheduleBranch(inst, branch, now());
  }

  /**
   * Applies a recorded adapter completion.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} wait Async wait.
   * @returns {boolean} True when the branch continues.
   */
  function finishAsync(inst, branch, wait) {
    const entry = inst.journal[wait.key];
    const done = wait.completion;
    if (entry) {
      entry.status = done.ok ? 'confirmed' : 'failed';
      entry.completedAt = now();
      entry.result = done.result;
    }
    if (!done.ok) {
      const err = taskError(
        done.uncertain ? ERROR_CODES.UNCERTAIN : ERROR_CODES.UNAVAILABLE,
        'adapterFailed',
        { adapter: wait.adapter, message: done.error || '' },
        { transient: false }
      );
      const step = getCompiled(inst.definitionId, inst.definitionRevision).steps.get(
        wait.stepId
      ).step;
      return handleStepError(inst, branch, step, err, true) === 'next-advanced';
    }
    inst.effects += 1;
    if (wait.saveAs) {
      branch.variables[wait.saveAs] = done.result;
    }
    return true;
  }

  /**
   * Handles an adapter call that did not answer in time. The outcome is
   * unknown, so the adapter's status lookup is tried before review.
   *
   * @param {object} job Job.
   * @returns {void}
   */
  function onAsyncTimeout(job) {
    const live = liveTarget(job);
    if (!live || live.branch.wait?.kind !== 'async' || live.branch.wait.opId !== job.target.opId) {
      return;
    }
    const { inst, branch } = live;
    const wait = branch.wait;
    const status = maybeCall('adapterStatus', wait.adapter, wait.action, wait.key);
    if (status?.done) {
      wait.completion = { ok: true, result: compactResult(status.result) };
      scheduleBranch(inst, branch, now());
      return;
    }
    if (inst.journal[wait.key]) {
      inst.journal[wait.key].status = 'uncertain';
    }
    timeline(inst, 'asyncTimeout', { stepId: wait.stepId });
    enterReview(inst, branch, 'uncertainOutcome', {
      stepId: wait.stepId,
      journalKey: wait.key,
      indexAdvanced: true,
    });
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  /**
   * Delivers a matching event to a waiting branch, consuming the wait once.
   *
   * @param {string} runId Run ID.
   * @param {string} branchId Branch ID.
   * @param {object} event Normalised event.
   * @returns {boolean} True when consumed.
   */
  function deliverEvent(runId, branchId, event) {
    const inst = getInstance(runId);
    const branch = inst?.branches[branchId];
    if (
      !inst ||
      !branch ||
      branch.wait?.kind !== 'event' ||
      inst.status === STATUS.PAUSED ||
      inst.status === STATUS.REVIEW
    ) {
      return false;
    }
    runtime.scheduler?.cancelKey(`await:${runId}:${branchId}`);
    branch.variables[branch.wait.saveAs] = {
      matched: true,
      timedOut: false,
      event: compactEvent(event),
    };
    timeline(inst, 'event', { stepId: branch.wait.stepId, type: event.type });
    branch.wait = null;
    branch.status = 'running';
    branch.gen += 1;
    inst.status = STATUS.RUNNING;
    maybeCall('awaitsChanged');
    scheduleBranch(inst, branch, now());
    touch(inst);
    return true;
  }

  /**
   * Handles an awaited event's timeout.
   *
   * @param {object} job Job.
   * @returns {void}
   */
  function onAwaitTimeout(job) {
    const live = liveTarget(job);
    if (!live || live.branch.wait?.kind !== 'event') {
      return;
    }
    const { inst, branch } = live;
    branch.variables[branch.wait.saveAs] = { matched: false, timedOut: true, event: null };
    timeline(inst, 'awaitTimeout', { stepId: branch.wait.stepId });
    branch.wait = null;
    branch.status = 'running';
    branch.gen += 1;
    inst.status = STATUS.RUNNING;
    maybeCall('awaitsChanged');
    runBranch(inst, branch);
  }

  /**
   * Returns a storable copy of an event.
   *
   * @param {object} event Event.
   * @returns {object} Compact event.
   */
  function compactEvent(event) {
    const out = {};
    for (const key of [
      'id',
      'type',
      'source',
      'objectType',
      'objectId',
      'pageId',
      'characterId',
      'name',
      'value',
      'actor',
      'observedAt',
      'old',
      'new',
      'count',
    ]) {
      if (event[key] !== undefined) {
        out[key] = event[key];
      }
    }
    return clone(out);
  }

  /**
   * Returns the branches waiting for events of a type, for the router.
   *
   * @returns {{runId: string, branchId: string, wait: object, inst: object}[]} Waits.
   */
  function eventWaits() {
    const out = [];
    for (const inst of Object.values(getState().instances)) {
      if (inst.status !== STATUS.RUNNING && inst.status !== STATUS.WAITING) {
        continue;
      }
      for (const branch of Object.values(inst.branches)) {
        if (branch.wait?.kind === 'event') {
          out.push({ runId: inst.id, branchId: branch.id, wait: branch.wait, inst, branch });
        }
      }
    }
    return out;
  }

  /**
   * Emits an internal task lifecycle event.
   *
   * @param {object} inst Instance.
   * @param {string} type Event type.
   * @returns {void}
   */
  function emitTaskEvent(inst, type) {
    maybeCall('emitEvent', {
      type,
      objectType: 'run',
      objectId: inst.id,
      name: inst.definitionId,
      value: inst.status,
      source: 'internal',
      correlation: {
        runId: inst.id,
        rootId: inst.correlation.rootId,
        depth: inst.correlation.depth + 1,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Expressions and targets
  // ---------------------------------------------------------------------------

  /**
   * Evaluates an expression in a run's context.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {*} expr Expression.
   * @returns {*} Value or MISSING.
   */
  function evalExpr(inst, branch, expr) {
    return evaluate(expr, { resolve: (path) => resolveRef(inst, branch, path) });
  }

  /**
   * Renders a template in a run's context.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {string} template Template.
   * @param {(value: string) => string} sanitise Escaping for the destination.
   * @param {object} [args] Extra `args.*` values.
   * @returns {string} Text.
   */
  function render(inst, branch, template, sanitise, args) {
    const resolve = (path) => {
      if (path.startsWith('args.') && args) {
        return readPath(args, path.split('.').slice(1));
      }
      return resolveRef(inst, branch, path);
    };
    return renderTemplate(template, resolve, sanitise).text;
  }

  /**
   * Resolves a reference path for expressions and templates. Only declared
   * roots and allowlisted object properties are readable.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {string} path Dotted path.
   * @returns {{found: boolean, value?: *}} Result.
   */
  function resolveRef(inst, branch, path) {
    const parts = path.split('.');
    const root = parts.shift();
    switch (root) {
      case 'param':
        return readPath(inst.params, parts);
      case 'var':
        return readPath(branch.variables, parts);
      case 'event':
        return inst.event ? readPath(inst.event, parts) : { found: false };
      case 'now':
        return parts.length ? { found: false } : { found: true, value: now() };
      case 'bindings': {
        const ids = inst.bindings[parts[0]];
        if (!ids) {
          return { found: false };
        }
        if (parts[1] === 'count') {
          return { found: true, value: ids.length };
        }
        return parts.length === 1 ? { found: true, value: [...ids] } : { found: false };
      }
      case 'run': {
        const loop = branch.frames.filter((f) => f.loop).at(-1);
        const values = {
          id: inst.id,
          definition: inst.definitionId,
          revision: inst.definitionRevision,
          initiator: inst.initiatorPlayerId,
          startedAt: inst.startedAt,
          iteration: loop ? loop.loop.iteration : 0,
          intendedDueAt: inst.intendedDueAt,
          missedCount: inst.occurrence?.missedCount ?? 0,
          branch: branch.label,
        };
        return parts.length === 1 && parts[0] in values && values[parts[0]] !== null
          ? { found: true, value: values[parts[0]] }
          : { found: false };
      }
      case 'target': {
        const [name, prop] = parts;
        const ids = inst.bindings[name] || [];
        if (prop === 'count') {
          return { found: true, value: ids.length };
        }
        const found = ids.length ? findAnyTarget(ids[0]) : null;
        if (!found || parts.length !== 2) {
          return { found: false };
        }
        return readProperty(found.obj, found.type, prop);
      }
      default:
        return { found: false };
    }
  }

  /**
   * Resolves a step target to live objects. Missing objects are skipped;
   * the action decides whether that is an error.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} spec {binding} | {ids} | {ref}.
   * @param {string} type Expected object type.
   * @returns {{id: string, obj: object, type: string}[]} Targets.
   */
  function resolveTargets(inst, branch, spec, type) {
    let ids = [];
    if (isRecord(spec) && 'binding' in spec) {
      const decl = defOf(inst)?.bindings?.[spec.binding];
      ids =
        decl?.from === 'query' && decl.query.evaluate === 'step'
          ? runQuery(decl.query, decl.objectType)
          : inst.bindings[spec.binding] || [];
    } else if (isRecord(spec) && Array.isArray(spec.ids)) {
      ids = spec.ids;
    } else if (isRecord(spec) && 'ref' in spec) {
      const value = evalExpr(inst, branch, { ref: spec.ref });
      ids = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
    }
    const out = [];
    for (const id of ids.slice(0, 100)) {
      const obj = getTarget(type, id);
      if (obj) {
        out.push({ id, obj, type });
        continue;
      }
      // A character step accepts tokens that represent characters.
      if (type === 'character') {
        const token = getTarget('graphic', id);
        if (token) {
          out.push({ id, obj: token, type: 'graphic' });
        }
      }
    }
    return out;
  }

  /**
   * Returns true when a run acts with GM authority.
   *
   * @param {object} inst Instance.
   * @returns {boolean} True for GM authority.
   */
  function hasGmAuthority(inst) {
    return inst.authority === 'gmService' || isGm(inst.initiatorPlayerId);
  }

  /**
   * Returns true when any branch of a run is ready to run.
   *
   * @param {object} inst Instance.
   * @returns {boolean} True when one is running.
   */
  function anyRunning(inst) {
    return Object.values(inst.branches).some((b) => b.status === 'running');
  }

  // ---------------------------------------------------------------------------
  // Errors, branches and joins
  // ---------------------------------------------------------------------------

  /**
   * Applies a step's error policy.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} step Failed step.
   * @param {*} err Error.
   * @param {boolean} advanced True when the frame already points past the step.
   * @returns {'next'|'suspend'|'stop'} What the branch does next.
   */
  function handleStepError(inst, branch, step, err, advanced) {
    const typed = asTaskError(err);
    // Errors keep the object ID and add its name for messages.
    if (typed.vars?.id && !typed.vars.name) {
      typed.vars.name = targetLabel(typed.vars.id);
    }
    const def = defOf(inst);
    const replay = replayClass(step);
    const frame = branch.frames.at(-1);
    timeline(inst, 'error', { stepId: step.id, code: typed.code, reason: typed.reason });
    const journal = Object.values(inst.journal)
      .filter((e) => e.stepId === step.id && e.branchId === branch.id)
      .at(-1);
    if (
      typed.code === ERROR_CODES.UNAUTHORIZED &&
      ['controlLost', 'initiatorGone', 'publicationRevoked'].includes(typed.reason)
    ) {
      enterReview(inst, branch, typed.reason, {
        stepId: step.id,
        indexAdvanced: advanced,
        vars: typed.vars,
      });
      return 'stop';
    }
    if (typed.reason === 'adapterUnavailable') {
      enterReview(inst, branch, 'adapterUnavailable', {
        stepId: step.id,
        indexAdvanced: advanced,
        vars: typed.vars,
      });
      createIncident({
        kind: 'adapter',
        cause: 'adapterUnavailable',
        runId: inst.id,
        definitionId: inst.definitionId,
        evidence: typed.vars.adapter,
      });
      return 'stop';
    }
    if (typed.uncertain && (replay === REPLAY.NON_IDEMPOTENT || replay === REPLAY.ACKNOWLEDGED)) {
      enterReview(inst, branch, 'uncertainOutcome', {
        stepId: step.id,
        indexAdvanced: advanced,
        journalKey: journal ? keyOf(inst, journal) : null,
      });
      return 'stop';
    }
    if (journal && journal.status === 'prepared') {
      journal.status = 'failed';
      journal.error = { code: typed.code, reason: typed.reason };
    }
    const policy = step.onError || def?.policy?.onError || 'fail';
    const retry =
      step.retry ||
      def?.policy?.retry ||
      (policy === 'retry' ? { maxAttempts: 3, baseDelayMs: 1000, maxDelayMs: 30000 } : null);
    const attempt = branch.attempts[step.id] || 1;
    if (
      retry &&
      (policy === 'retry' || step.retry) &&
      typed.transient &&
      attempt < retry.maxAttempts
    ) {
      const base = retry.baseDelayMs ?? 1000;
      const delay =
        Math.min(base * 2 ** (attempt - 1), retry.maxDelayMs ?? 30000) +
        Math.floor(Math.random() * (retry.jitterMs ?? 0));
      branch.attempts[step.id] = attempt + 1;
      if (advanced && frame) {
        frame.index -= 1;
      }
      branch.gen += 1;
      branch.wait = {
        kind: 'retry',
        dueAt: now() + Math.max(delay, 10),
        stepId: step.id,
        attempt: attempt + 1,
      };
      branch.status = 'waiting';
      timeline(inst, 'retry', { stepId: step.id, attempt: attempt + 1 });
      scheduleBranch(inst, branch, branch.wait.dueAt, JOB.RETRY);
      touch(inst);
      return 'suspend';
    }
    delete branch.attempts[step.id];
    if (policy === 'skip') {
      timeline(inst, 'skip', { stepId: step.id });
      if (journal && journal.status === 'failed') {
        journal.status = 'skipped';
      }
      if (advanced) {
        return 'next-advanced';
      }
      return 'next';
    }
    if (policy === 'review') {
      enterReview(inst, branch, 'stepError', {
        stepId: step.id,
        indexAdvanced: advanced,
        vars: { code: typed.code, reason: typed.reason },
      });
      return 'stop';
    }
    failBranch(inst, branch, errorRecord(typed, step.id));
    return 'stop';
  }

  /**
   * Returns the journal key of an entry.
   *
   * @param {object} inst Instance.
   * @param {object} entry Journal entry.
   * @returns {string|null} Key.
   */
  function keyOf(inst, entry) {
    return Object.keys(inst.journal).find((k) => inst.journal[k] === entry) || null;
  }

  /**
   * Marks a branch failed and propagates the failure.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @param {object} error Error record.
   * @returns {void}
   */
  function failBranch(inst, branch, error) {
    branch.status = 'failed';
    branch.error = error;
    branch.wait = null;
    branch.gen += 1;
    if (branch.id === 'main') {
      finalize(inst, STATUS.FAILED, error);
      return;
    }
    onSubBranchTerminal(inst, branch);
  }

  /**
   * Marks a branch completed and propagates.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @returns {void}
   */
  function completeBranch(inst, branch) {
    branch.status = 'completed';
    branch.wait = null;
    branch.gen += 1;
    if (branch.id === 'main') {
      finalize(inst, STATUS.COMPLETED, null);
      return;
    }
    onSubBranchTerminal(inst, branch);
  }

  /**
   * Re-evaluates a parallel join after one of its branches finished.
   *
   * @param {object} inst Instance.
   * @param {object} branch Finished sub-branch.
   * @returns {void}
   */
  function onSubBranchTerminal(inst, branch) {
    const parent = inst.branches[branch.parentId];
    const wait = parent?.wait;
    if (
      !parent ||
      wait?.kind !== 'join' ||
      !wait.children.includes(branch.id) ||
      TERMINAL_STATUSES.has(inst.status)
    ) {
      return;
    }
    const children = wait.children.map((id) => inst.branches[id]);
    const finished = children.filter((b) =>
      ['completed', 'failed', 'cancelled'].includes(b.status)
    );
    const succeeded = children.filter((b) => b.status === 'completed');
    let decided = null;
    if (wait.join === 'all') {
      if (finished.length === children.length) {
        const failed = children.find((b) => b.status === 'failed');
        decided = failed ? { ok: false, error: failed.error } : { ok: true };
      }
    } else if (wait.join === 'anySuccess') {
      if (succeeded.length) {
        decided = { ok: true, winner: succeeded[0].id };
      } else if (finished.length === children.length) {
        decided = {
          ok: false,
          error:
            children.find((b) => b.error)?.error ||
            errorRecord(taskError(ERROR_CODES.INTERNAL, 'allBranchesFailed', {})),
        };
      }
    } else if (wait.join === 'race') {
      decided =
        branch.status === 'completed'
          ? { ok: true, winner: branch.id }
          : { ok: false, error: branch.error };
    }
    if (!decided) {
      touch(inst);
      return;
    }
    if (wait.join !== 'all' && wait.cancelLosers) {
      for (const child of children) {
        if (child.status === 'running' || child.status === 'waiting') {
          cancelBranch(inst, child);
        }
      }
    }
    const step = getCompiled(inst.definitionId, inst.definitionRevision).steps.get(
      wait.stepId
    ).step;
    const results = {};
    for (const child of children) {
      results[child.label] = {
        status: child.status,
        vars: child.status === 'completed' ? child.variables : null,
      };
    }
    parent.variables[step.saveAs || step.id] = clone(results);
    for (const rule of step.merge || []) {
      parent.variables[rule.name] = reduceMerge(rule, results);
    }
    timeline(inst, 'join', { stepId: step.id, ok: decided.ok, winner: decided.winner });
    parent.wait = null;
    parent.gen += 1;
    if (!decided.ok) {
      parent.status = 'running';
      failBranch(
        inst,
        parent,
        decided.error || errorRecord(taskError(ERROR_CODES.INTERNAL, 'branchFailed', {}))
      );
      return;
    }
    parent.status = 'running';
    inst.status = STATUS.RUNNING;
    scheduleBranch(inst, parent, now());
    touch(inst);
  }

  /**
   * Applies an explicit merge reducer to branch results.
   *
   * @param {object} rule {name, from?, var?, reducer}.
   * @param {object} results Branch results by branch ID.
   * @returns {*} Merged value.
   */
  function reduceMerge(rule, results) {
    const source = rule.var || rule.name;
    const values = Object.entries(results)
      .filter(([id, r]) => r.status === 'completed' && (!rule.from || rule.from.includes(id)))
      .map(([, r]) => r.vars?.[source])
      .filter((v) => v !== undefined && v !== null);
    const numbers = values.filter((v) => typeof v === 'number');
    switch (rule.reducer) {
      case 'sum':
        return numbers.reduce((a, b) => a + b, 0);
      case 'min':
        return numbers.length ? Math.min(...numbers) : null;
      case 'max':
        return numbers.length ? Math.max(...numbers) : null;
      case 'first':
        return values[0] ?? null;
      case 'last':
        return values.at(-1) ?? null;
      case 'count':
        return values.length;
      case 'all':
        return values.length > 0 && values.every(Boolean);
      case 'any':
        return values.some(Boolean);
      default:
        return null;
    }
  }

  /**
   * Cancels one branch (a parallel loser).
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch.
   * @returns {void}
   */
  function cancelBranch(inst, branch) {
    if (branch.wait?.kind === 'child') {
      cancelRun(branch.wait.childId, null, 'branchCancelled');
    }
    for (const child of Object.values(inst.branches)) {
      if (
        child.parentId === branch.id &&
        (child.status === 'running' || child.status === 'waiting')
      ) {
        cancelBranch(inst, child);
      }
    }
    branch.status = 'cancelled';
    branch.wait = null;
    branch.gen += 1;
    runtime.scheduler?.cancelKey(`run:${inst.id}:${branch.id}`);
    runtime.scheduler?.cancelKey(`await:${inst.id}:${branch.id}`);
    runtime.scheduler?.cancelKey(`async:${inst.id}:${branch.id}`);
  }

  // ---------------------------------------------------------------------------
  // Children
  // ---------------------------------------------------------------------------

  /**
   * Tells a parent that an owned child finished.
   *
   * @param {object} child Child instance.
   * @returns {void}
   */
  function notifyParent(child) {
    if (!child.parentId || !child.owned) {
      return;
    }
    const parent = getInstance(child.parentId);
    const branch = parent?.branches[child.parentBranchId];
    if (
      !branch ||
      branch.wait?.kind !== 'child' ||
      branch.wait.childId !== child.id ||
      TERMINAL_STATUSES.has(parent.status)
    ) {
      return;
    }
    branch.wait.completion = {
      status: child.status,
      error: child.error,
      vars: clone(child.branches.main?.variables || {}),
    };
    if (parent.status === STATUS.PAUSED || parent.status === STATUS.REVIEW) {
      return;
    }
    scheduleBranch(parent, branch, now());
  }

  /**
   * Applies a child's outcome to the waiting parent branch.
   *
   * @param {object} inst Parent instance.
   * @param {object} branch Parent branch.
   * @param {object} wait Child wait.
   * @returns {boolean} True when the branch continues.
   */
  function finishChildWait(inst, branch, wait) {
    const done = wait.completion;
    branch.variables[wait.saveAs] = { runId: wait.childId, status: done.status, vars: done.vars };
    timeline(inst, 'childDone', { stepId: wait.stepId, child: wait.childId, status: done.status });
    if (done.status !== STATUS.COMPLETED && wait.onChildFail !== 'continue') {
      const step = getCompiled(inst.definitionId, inst.definitionRevision).steps.get(
        wait.stepId
      ).step;
      const err = taskError(
        ERROR_CODES.INTERNAL,
        'childFailed',
        { child: wait.childId, status: done.status },
        { transient: false }
      );
      return handleStepError(inst, branch, step, err, true) === 'next-advanced';
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Pause, resume, cancel, review
  // ---------------------------------------------------------------------------

  /**
   * Freezes a run's waits: relative waits keep their remaining time, event
   * waits stop listening.
   *
   * @param {object} inst Instance.
   * @returns {void}
   */
  function freeze(inst) {
    const at = now();
    for (const branch of Object.values(inst.branches)) {
      const wait = branch.wait;
      if (!wait) {
        continue;
      }
      if ((wait.kind === 'time' && !wait.absolute) || wait.kind === 'retry') {
        wait.remainingMs = Math.max(0, wait.dueAt - at);
      } else if (wait.kind === 'event') {
        wait.remainingMs = Math.max(0, wait.timeoutAt - at);
      }
    }
    inst.generation += 1;
    cancelJobs(inst);
    maybeCall('awaitsChanged');
  }

  /**
   * Re-creates the jobs of a run from its persisted waits.
   *
   * @param {object} inst Instance.
   * @param {{thaw?: boolean, gapFrom?: number}} [options] Thaw relative waits; note an observation gap.
   * @returns {void}
   */
  function rebuildJobs(inst, { thaw = false, gapFrom } = {}) {
    const at = now();
    for (const branch of Object.values(inst.branches)) {
      const wait = branch.wait;
      if (branch.status === 'running' && !wait) {
        scheduleBranch(inst, branch, at);
        continue;
      }
      if (!wait) {
        continue;
      }
      switch (wait.kind) {
        case 'time':
        case 'retry':
          if (thaw && wait.remainingMs !== undefined && wait.remainingMs !== null) {
            wait.dueAt = at + wait.remainingMs;
          }
          wait.remainingMs = null;
          scheduleBranch(
            inst,
            branch,
            wait.dueAt,
            wait.kind === 'retry' ? JOB.RETRY : JOB.CONTINUE
          );
          break;
        case 'yield':
          scheduleBranch(inst, branch, at);
          break;
        case 'event':
          if (thaw && wait.remainingMs !== undefined && wait.remainingMs !== null) {
            wait.timeoutAt = at + wait.remainingMs;
            wait.remainingMs = null;
          }
          if (gapFrom) {
            timeline(inst, 'observationGap', { stepId: wait.stepId, from: gapFrom, to: at });
            wait.gaps = (wait.gaps || 0) + 1;
          }
          schedule({
            kind: JOB.AWAIT_TIMEOUT,
            dueAt: wait.timeoutAt,
            key: `await:${inst.id}:${branch.id}`,
            target: { runId: inst.id, branchId: branch.id, gen: inst.generation, bgen: branch.gen },
          });
          break;
        case 'async':
          if (wait.completion) {
            scheduleBranch(inst, branch, at);
          } else {
            schedule({
              kind: JOB.ASYNC_TIMEOUT,
              dueAt: wait.timeoutAt,
              key: `async:${inst.id}:${branch.id}`,
              target: {
                runId: inst.id,
                branchId: branch.id,
                gen: inst.generation,
                bgen: branch.gen,
                opId: wait.opId,
              },
            });
          }
          break;
        case 'child':
        case 'join':
          if (wait.completion) {
            scheduleBranch(inst, branch, at);
          }
          break;
      }
    }
    maybeCall('awaitsChanged');
  }

  /**
   * Pauses a run and its owned children.
   *
   * @param {string} runId Run ID.
   * @param {string|null} by Player ID.
   * @param {{byParent?: boolean}} [options] Paused by its parent.
   * @returns {{ok: boolean, error?: string, vars?: object}} Result.
   */
  function pauseRun(runId, by, { byParent = false } = {}) {
    const inst = getInstance(runId);
    if (!inst) {
      return { ok: false, error: 'runNotFound', vars: { id: runId } };
    }
    if (inst.status !== STATUS.RUNNING && inst.status !== STATUS.WAITING) {
      return { ok: false, error: 'notPausable', vars: { id: runId, status: inst.status } };
    }
    freeze(inst);
    inst.pause = { previous: inst.status, at: now(), by: by || null, byParent };
    inst.status = STATUS.PAUSED;
    timeline(inst, 'pause', { by });
    audit('run.pause', { run: runId, by });
    bump(inst);
    for (const childId of inst.children) {
      const child = getInstance(childId);
      if (child?.owned && (child.status === STATUS.RUNNING || child.status === STATUS.WAITING)) {
        pauseRun(childId, by, { byParent: true });
      }
    }
    touch(inst);
    return { ok: true };
  }

  /**
   * Resumes a paused run. Relative waits keep their remaining time; event waits
   * listen again and the pause is recorded as an observation gap.
   *
   * @param {string} runId Run ID.
   * @param {string|null} by Player ID.
   * @returns {{ok: boolean, error?: string, vars?: object}} Result.
   */
  function resumeRun(runId, by) {
    const inst = getInstance(runId);
    if (!inst) {
      return { ok: false, error: 'runNotFound', vars: { id: runId } };
    }
    if (inst.status !== STATUS.PAUSED) {
      return { ok: false, error: 'notPaused', vars: { id: runId } };
    }
    const gapFrom = inst.pause?.at;
    inst.status = anyRunning(inst) ? STATUS.RUNNING : STATUS.WAITING;
    inst.pause = null;
    inst.generation += 1;
    timeline(inst, 'resume', { by });
    audit('run.resume', { run: runId, by });
    bump(inst);
    rebuildJobs(inst, { thaw: true, gapFrom });
    for (const childId of inst.children) {
      const child = getInstance(childId);
      if (child?.status === STATUS.PAUSED && child.pause?.byParent) {
        resumeRun(childId, by);
      }
    }
    touch(inst);
    return { ok: true };
  }

  /**
   * Cancels a run, its jobs, its waits and its owned children. Effects already
   * applied stay applied and are listed in the journal.
   *
   * @param {string} runId Run ID.
   * @param {string|null} by Player ID.
   * @param {string} [reason='cancelled'] Reason key.
   * @returns {{ok: boolean, error?: string, vars?: object}} Result.
   */
  function cancelRun(runId, by, reason = 'cancelled') {
    const inst = getInstance(runId);
    if (!inst) {
      return { ok: false, error: 'runNotFound', vars: { id: runId } };
    }
    if (!ACTIVE_STATUSES.has(inst.status)) {
      return { ok: false, error: 'notActive', vars: { id: runId, status: inst.status } };
    }
    finalize(inst, STATUS.CANCELLED, {
      code: 'cancelled',
      reason,
      vars: { by: by || '' },
      stepId: null,
    });
    return { ok: true };
  }

  /**
   * Puts a run into review: nothing advances until a GM decides.
   *
   * @param {object} inst Instance.
   * @param {object} branch Branch that needs the decision.
   * @param {string} reason Reason key.
   * @param {object} detail Step, journal key, index state.
   * @returns {void}
   */
  function enterReview(inst, branch, reason, detail) {
    if (inst.status === STATUS.REVIEW) {
      return;
    }
    freeze(inst);
    inst.review = { reason, branchId: branch.id, at: now(), ...detail, previous: inst.status };
    branch.status = 'waiting';
    branch.wait = branch.wait || { kind: 'review', stepId: detail.stepId };
    inst.status = STATUS.REVIEW;
    timeline(inst, 'review', { reason, stepId: detail.stepId });
    audit('run.review', { run: inst.id, reason, step: detail.stepId });
    const incident = createIncident({
      kind: 'review',
      cause: reason,
      runId: inst.id,
      definitionId: inst.definitionId,
      evidence: detail.stepId,
      group: `review:${inst.id}`,
    });
    inst.review.incidentId = incident.id;
    maybeCall('notifyGm', 'review', { id: inst.id, reason, step: detail.stepId || '' });
    bump(inst);
  }

  /**
   * Applies a GM decision to a run in review.
   *
   * @param {string} runId Run ID.
   * @param {'retry'|'skip'|'complete'|'skipNext'|'cancel'} decision Decision.
   * @param {string} by GM player ID.
   * @returns {{ok: boolean, error?: string, vars?: object}} Result.
   */
  function decideReview(runId, decision, by) {
    const inst = getInstance(runId);
    if (!inst || inst.status !== STATUS.REVIEW || !inst.review) {
      return { ok: false, error: 'notInReview', vars: { id: runId } };
    }
    const review = inst.review;
    if (review.incidentId) {
      resolveIncident(review.incidentId, decision, by);
    }
    audit('run.decide', { run: runId, decision, by });
    if (decision === 'cancel') {
      inst.status = review.previous === STATUS.PAUSED ? STATUS.PAUSED : STATUS.RUNNING;
      return cancelRun(runId, by, 'reviewCancelled');
    }
    const branch = inst.branches[review.branchId];
    const frame = branch?.frames.at(-1);
    if (review.journalKey && inst.journal[review.journalKey]) {
      inst.journal[review.journalKey].status =
        decision === 'complete' ? 'confirmed' : decision === 'skip' ? 'skipped' : 'abandoned';
      inst.journal[review.journalKey].decidedBy = by;
    }
    if (branch && frame && review.stepId) {
      if (decision === 'retry' && review.indexAdvanced) {
        frame.index -= 1;
      }
      if ((decision === 'skip' || decision === 'complete') && !review.indexAdvanced) {
        frame.index += 1;
      }
      if (decision === 'skipNext') {
        frame.index += 1;
      }
      if (decision === 'retry') {
        branch.attempts[review.stepId] = (branch.attempts[review.stepId] || 1) + 1;
      }
    }
    if (branch && ['review', 'async', 'time'].includes(branch.wait?.kind) && review.stepId) {
      branch.wait = null;
      branch.status = 'running';
    }
    inst.review = null;
    inst.status = STATUS.RUNNING;
    inst.generation += 1;
    timeline(inst, 'decide', { decision, by });
    rebuildJobs(inst, { thaw: true });
    bump(inst);
    return { ok: true };
  }

  /**
   * Starts a fresh run linked to an earlier one.
   *
   * @param {string} runId Earlier run ID (instance or history).
   * @param {string} by Player ID.
   * @returns {object} Admission result.
   */
  function rerun(runId, by) {
    const s = getState();
    const source = getInstance(runId) || s.history.find((h) => h.id === runId);
    if (!source) {
      return { ok: false, status: 'rejected', reason: 'runNotFound', vars: { id: runId } };
    }
    if (source.status && ACTIVE_STATUSES.has(source.status)) {
      return { ok: false, status: 'rejected', reason: 'stillActive', vars: { id: runId } };
    }
    return admitRun(source.definitionId, {
      initiatorId: by,
      params: source.params,
      bindings: source.bindings,
      trigger: { type: 'rerun', id: runId },
      rerunOf: runId,
    });
  }

  /**
   * Finishes a run: terminalises branches, cancels owned children, records
   * history, notifies the parent and frees the queue.
   *
   * @param {object} inst Instance.
   * @param {string} status Terminal status.
   * @param {object|null} error Error record.
   * @returns {void}
   */
  function finalize(inst, status, error) {
    if (TERMINAL_STATUSES.has(inst.status)) {
      return;
    }
    const at = now();
    inst.status = status;
    inst.error = error;
    inst.outcome = status;
    inst.completedAt = at;
    inst.generation += 1;
    inst.revision += 1;
    inst.pause = null;
    cancelJobs(inst, true);
    for (const branch of Object.values(inst.branches)) {
      if (branch.status === 'running' || branch.status === 'waiting') {
        branch.status = status === STATUS.COMPLETED ? 'completed' : 'cancelled';
        branch.wait = null;
      }
    }
    for (const childId of inst.children) {
      const child = getInstance(childId);
      if (child?.owned && ACTIVE_STATUSES.has(child.status)) {
        cancelRun(childId, null, 'parentFinished');
      }
    }
    if (inst.review?.incidentId) {
      resolveIncident(inst.review.incidentId, status, null);
    }
    inst.review = null;
    timeline(inst, 'end', { status, code: error?.code, reason: error?.reason });
    count(status === STATUS.COMPLETED ? 'completed' : 'failed');
    recordHistory({
      id: inst.id,
      definitionId: inst.definitionId,
      revision: inst.definitionRevision,
      name: inst.name,
      status,
      initiator: inst.initiatorPlayerId,
      trigger: inst.trigger?.type,
      createdAt: inst.createdAt,
      completedAt: at,
      durationMs: at - inst.startedAt,
      latenessMs: inst.latenessMs,
      effects: inst.effects,
      error,
      params: inst.params,
      bindings: inst.bindings,
      parentId: inst.parentId,
      rerunOf: inst.rerunOf,
      uncertain: Object.values(inst.journal).filter((e) =>
        ['prepared', 'uncertain', 'dispatched'].includes(e.status)
      ).length,
    });
    audit('run.end', { run: inst.id, status, reason: error?.reason });
    emitTaskEvent(
      inst,
      {
        completed: 'task.completed',
        failed: 'task.failed',
        expired: 'task.failed',
        cancelled: 'task.cancelled',
      }[status]
    );
    maybeCall('awaitsChanged');
    notifyParent(inst);
    maybeCall('runTerminal', inst);
    drainQueue(inst.definitionId);
    pruneTerminal();
    maybeCall('dashboardDirty', 'instances');
  }

  /**
   * Keeps only the most recent finished runs in full; history keeps summaries.
   *
   * @returns {void}
   */
  function pruneTerminal() {
    const s = getState();
    const terminal = Object.values(s.instances)
      .filter((i) => TERMINAL_STATUSES.has(i.status))
      .sort((a, b) => b.completedAt - a.completedAt);
    for (const inst of terminal.slice(RETAIN_TERMINAL)) {
      // Keep finished children while their parent still runs.
      const parent = inst.parentId ? s.instances[inst.parentId] : null;
      if (parent && ACTIVE_STATUSES.has(parent.status)) {
        continue;
      }
      delete s.instances[inst.id];
    }
  }

  /**
   * Returns the step a run is on, for the dashboard.
   *
   * @param {object} inst Instance.
   * @returns {string} Step ID, or an empty string.
   */
  function currentStep(inst) {
    const main = inst.branches.main;
    if (!main) {
      return '';
    }
    if (main.wait?.stepId) {
      return main.wait.stepId;
    }
    const frame = main.frames.at(-1);
    if (!frame) {
      return '';
    }
    const compiled = getCompiled(inst.definitionId, inst.definitionRevision);
    return compiled?.blocks.get(frame.block)?.[frame.index]?.id || '';
  }

  // ---------------------------------------------------------------------------
  // Restart recovery (plan §8)
  // ---------------------------------------------------------------------------

  /**
   * Compares an interrupted action's intended result with the live objects.
   *
   * @param {object} entry Journal entry (prepared or dispatched).
   * @param {object} step Step.
   * @returns {'confirmed'|'notApplied'|'conflict'|'unknown'} Reconciliation.
   */
  function reconcileEntry(entry, step) {
    const data = entry.data || {};
    const graphic = (id) => getTarget('graphic', id);
    if (data.resolvedSide) {
      const results = Object.entries(data.resolvedSide).map(([id, side]) => {
        const token = graphic(id);
        return token ? Number(token.get('currentSide')) === side : false;
      });
      return results.every(Boolean) ? 'confirmed' : 'conflict';
    }
    if (step.type === 'attribute.adjust' && data.plan) {
      const field = data.field || 'current';
      const states = Object.values(data.plan).map((p) => {
        const attr = getTarget('attribute', p.attrId);
        const value = Number(attr?.get(field));
        return value === p.new ? 'new' : value === p.old ? 'old' : 'other';
      });
      if (states.every((x) => x === 'new')) {
        return 'confirmed';
      }
      return 'conflict';
    }
    if (step.type === 'token.set' && data.set) {
      // Absolute writes: done if every target already holds the values.
      return 'unknown';
    }
    if (step.type === 'attribute.set' && data.old) {
      return 'unknown';
    }
    return 'unknown';
  }

  /**
   * Reconciles one run after a restart: interrupted actions follow their
   * replay class, callbacks from the old boot are written off, finished
   * children and joins are re-checked, and jobs are rebuilt.
   *
   * @param {object} inst Instance.
   * @param {{gapFrom: number|null}} context Restart context.
   * @returns {{review: boolean, gap: boolean}} What happened.
   */
  function recoverInstance(inst, { gapFrom }) {
    const outcome = { review: false, gap: false };
    const def = defOf(inst);
    const compiled = getCompiled(inst.definitionId, inst.definitionRevision);
    if (!def || !compiled) {
      finalize(
        inst,
        STATUS.FAILED,
        errorRecord(taskError(ERROR_CODES.VALIDATION, 'revisionMissing', { id: inst.definitionId }))
      );
      return outcome;
    }
    inst.generation += 1;
    if (inst.status === STATUS.PAUSED || inst.status === STATUS.REVIEW) {
      return outcome;
    }
    const restart = def.policy?.restart || 'reconcile';
    if (restart === 'fail') {
      finalize(
        inst,
        STATUS.FAILED,
        errorRecord(taskError(ERROR_CODES.UNCERTAIN, 'restartPolicyFail', {}))
      );
      return outcome;
    }
    // Interrupted synchronous actions.
    for (const [key, entry] of Object.entries(inst.journal)) {
      if (entry.status !== 'prepared') {
        continue;
      }
      const branch = inst.branches[entry.branchId];
      const step = compiled.steps.get(entry.stepId)?.step;
      if (!branch || !step) {
        entry.status = 'abandoned';
        continue;
      }
      const replay = entry.replay;
      if (replay === REPLAY.EPHEMERAL) {
        entry.status = 'skipped';
        continue;
      }
      const verdict = reconcileEntry(entry, step);
      if (verdict === 'confirmed') {
        entry.status = 'confirmed';
        entry.reconciled = true;
        const frame = branch.frames.at(-1);
        if (frame && compiled.blocks.get(frame.block)?.[frame.index]?.id === step.id) {
          frame.index += 1;
        }
        continue;
      }
      if (replay === REPLAY.IDEMPOTENT && verdict !== 'conflict' && !step.expect) {
        // Safe to apply again: the step re-runs with the same absolute values.
        entry.status = 'abandoned';
        continue;
      }
      entry.status = 'uncertain';
      enterReview(inst, branch, verdict === 'conflict' ? 'restartConflict' : 'uncertainOutcome', {
        stepId: step.id,
        journalKey: key,
        indexAdvanced: false,
      });
      outcome.review = true;
      return outcome;
    }
    for (const branch of Object.values(inst.branches)) {
      const wait = branch.wait;
      if (!wait) {
        continue;
      }
      if (wait.kind === 'async' && !wait.completion && wait.bootId !== runtime.bootId) {
        const status = maybeCall('adapterStatus', wait.adapter, wait.action, wait.key);
        if (status?.done) {
          wait.completion = { ok: true, result: compactResult(status.result) };
        } else {
          if (inst.journal[wait.key]) {
            inst.journal[wait.key].status = 'uncertain';
          }
          enterReview(inst, branch, 'uncertainOutcome', {
            stepId: wait.stepId,
            journalKey: wait.key,
            indexAdvanced: true,
          });
          outcome.review = true;
          return outcome;
        }
      }
      if (wait.kind === 'child' && !wait.completion) {
        const child = getInstance(wait.childId);
        if (!child || TERMINAL_STATUSES.has(child.status)) {
          wait.completion = {
            status: child?.status || STATUS.FAILED,
            error: child?.error || null,
            vars: clone(child?.branches.main?.variables || {}),
          };
        }
      }
      if (wait.kind === 'event') {
        outcome.gap = true;
      }
    }
    if (restart === 'review') {
      enterReview(inst, inst.branches.main, 'restartPolicyReview', {
        stepId: currentStep(inst),
        indexAdvanced: false,
      });
      outcome.review = true;
      return outcome;
    }
    rebuildJobs(inst, { gapFrom: outcome.gap ? gapFrom : undefined });
    // Joins whose last branch finished just before the restart.
    for (const branch of Object.values(inst.branches)) {
      if (branch.parentId && ['completed', 'failed', 'cancelled'].includes(branch.status)) {
        onSubBranchTerminal(inst, branch);
      }
    }
    return outcome;
  }

  /**
   * Registers the executor's job handlers.
   *
   * @returns {void}
   */
  function registerExecutorJobs() {
    onJob(JOB.CONTINUE, onContinueJob);
    onJob(JOB.RETRY, onContinueJob);
    onJob(JOB.AWAIT_TIMEOUT, onAwaitTimeout);
    onJob(JOB.ASYNC_TIMEOUT, onAsyncTimeout);
    onJob(JOB.QUEUE_EXPIRY, onQueueExpiry);
  }

  // Time schedules (plan §5, §7): one record per time trigger or command-made
  // schedule, a persisted cursor and revision, duplicate-safe occurrence keys,
  // fixed-rate and fixed-delay intervals, and the overdue policies used after
  // downtime or a paused schedule.

  /**
   * Builds a normalised recurrence spec from a definition trigger.
   *
   * @param {object} trigger Time trigger.
   * @param {number} at Current time (default anchor).
   * @returns {{ok: boolean, spec?: object, error?: string}} Result.
   */
  function specFromTrigger(trigger, at) {
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
  function addSchedule({
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
  function armSchedule(sched) {
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
  function syncDefinitionSchedules(defId) {
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
  function removeSchedule(id, by) {
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
      admitOccurrence(sched, job.target.catchUp, { missedCount: 0 });
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
  function admitOccurrence(sched, due, info) {
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
  function handleOverdue(sched, cause) {
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
  function pauseSchedule(id, by, expectedRev) {
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
  function resumeSchedule(id, by, mode = 'skipPausedRange', expectedRev) {
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
  function previewOffset(id, offsetMinutes) {
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
  function applyOffset(id, offsetMinutes, by) {
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
  function applyRecovery(incident, mode, by) {
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
  function onRunTerminal(inst) {
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
  function recoverSchedules() {
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
      if (
        sched.cursor.nextDueAt !== null &&
        sched.cursor.nextDueAt + overdueOf(sched).graceMs < at
      ) {
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
  function listSchedules(defId) {
    return Object.values(getState().schedules)
      .filter((sc) => !defId || sc.definitionId === defId)
      .sort((a, b) => (a.cursor.nextDueAt ?? Infinity) - (b.cursor.nextDueAt ?? Infinity));
  }

  /**
   * Registers the schedule job handler.
   *
   * @returns {void}
   */
  function registerScheduleJobs() {
    onJob(JOB.OCCURRENCE, onOccurrence);
  }

  // GM dashboard handout and optional player view (plan §9). Content is a
  // snapshot rendered from state, written at most every two seconds through
  // one scheduler job, skipped when unchanged, and never trusted back.

  const S = {
    outer: `background:${COLOR_CARD_BG_BOTTOM};color:${COLOR_TEXT};padding:12px 16px;border:1px solid ${COLOR_BORDER};border-radius:6px;font-family:Arial,sans-serif;line-height:1.45;`,
    header: `background:${COLOR_HEADER_BG};padding:10px;border-radius:4px;text-align:center;border-bottom:3px solid ${COLOR_ACCENT};margin-bottom:8px;`,
    h1: `color:${COLOR_HEADER_TEXT};margin:0;font-size:1.5em;letter-spacing:0.05em;`,
    sub: `color:${COLOR_MUTED};margin:3px 0 0 0;font-size:0.85em;`,
    h2: `color:${COLOR_ACCENT};border-bottom:1px solid ${COLOR_BORDER};padding-bottom:2px;margin:14px 0 6px 0;font-size:1.15em;`,
    p: `color:${COLOR_TEXT};margin:4px 0;`,
    muted: `color:${COLOR_MUTED};font-size:0.85em;`,
    table: 'width:100%;border-collapse:collapse;margin:4px 0;font-size:0.88em;',
    th: `background:${COLOR_HEADER_BG};color:${COLOR_HEADER_TEXT};padding:4px 6px;text-align:left;border:1px solid ${COLOR_BORDER};`,
    td: `padding:4px 6px;border:1px solid ${COLOR_BORDER};vertical-align:top;color:${COLOR_TEXT};`,
    btn: `background:${COLOR_BUTTON_BG};color:${COLOR_BUTTON_TEXT};padding:2px 7px;border-radius:3px;text-decoration:none;font-size:0.85em;display:inline-block;margin:1px 2px;`,
    btnAlt: `background:${COLOR_BUTTON_ALT_BG};color:${COLOR_TEXT};border:1px solid ${COLOR_BUTTON_ALT_BORDER};padding:2px 7px;border-radius:3px;text-decoration:none;font-size:0.85em;display:inline-block;margin:1px 2px;`,
    btnDanger: `background:${COLOR_DANGER_BG};color:#ffffff;padding:2px 7px;border-radius:3px;text-decoration:none;font-size:0.85em;display:inline-block;margin:1px 2px;font-weight:bold;`,
    navOn: `background:${COLOR_ACCENT};color:#1d2a3a;padding:2px 8px;border-radius:3px;text-decoration:none;font-size:0.85em;display:inline-block;margin:1px 2px;font-weight:bold;`,
    ok: `color:${COLOR_OK};font-weight:bold;`,
    warn: `color:${COLOR_ACCENT};font-weight:bold;`,
  };

  const memory = { dirtySince: null, generation: 0, notices: new Map() };

  /**
   * Builds a command link. Only command words, opaque IDs and numbers go into
   * links; every value is quoted for the tokenizer and escaped for HTML.
   *
   * @param {string} label Link text.
   * @param {string[]} words Command words after the prefix.
   * @param {string} [style] Inline style.
   * @returns {string} HTML anchor.
   */
  function commandLink(label, words, style = S.btn) {
    const command = [COMMAND, ...words.map((w) => quoteArg(w))].join(' ');
    return `<a href="${escapeHtml(command)}" style="${style}">${escapeHtml(label)}</a>`;
  }

  /**
   * Builds a table.
   *
   * @param {string[]} headings Headings.
   * @param {string[][]} rows Cells (trusted HTML).
   * @returns {string} HTML.
   */
  function table$1(headings, rows) {
    if (!rows.length) {
      return '';
    }
    const head = headings.map((h) => `<th style="${S.th}">${escapeHtml(h)}</th>`).join('');
    const body = rows
      .map((cells) => `<tr>${cells.map((c) => `<td style="${S.td}">${c}</td>`).join('')}</tr>`)
      .join('');
    return `<table style="${S.table}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }

  /**
   * Returns one page of rows.
   *
   * @param {object[]} items Items.
   * @param {number} page 1-based page.
   * @returns {{items: object[], page: number, pages: number}} Page.
   */
  function paginate(items, page) {
    const size = getConfig().dashboardRows;
    const pages = Math.max(1, Math.ceil(items.length / size));
    const current = Math.min(Math.max(1, page), pages);
    return { items: items.slice((current - 1) * size, current * size), page: current, pages };
  }

  /**
   * Renders page navigation for a section.
   *
   * @param {string} view View.
   * @param {{page: number, pages: number}} paged Page info.
   * @param {string} lang Locale.
   * @returns {string} HTML.
   */
  function pager(view, paged, lang) {
    if (paged.pages <= 1) {
      return '';
    }
    const parts = [];
    if (paged.page > 1) {
      parts.push(
        commandLink(
          t('dashboard.prev', lang),
          ['dashboard', 'view', view, String(paged.page - 1)],
          S.btnAlt
        )
      );
    }
    parts.push(
      `<span style="${S.muted}">${escapeHtml(t('dashboard.page', lang, { page: paged.page, pages: paged.pages }))}</span>`
    );
    if (paged.page < paged.pages) {
      parts.push(
        commandLink(
          t('dashboard.next', lang),
          ['dashboard', 'view', view, String(paged.page + 1)],
          S.btnAlt
        )
      );
    }
    return `<div style="margin:4px 0">${parts.join(' ')}</div>`;
  }

  /**
   * Formats a deadline as UTC with the remaining time as of this render.
   *
   * @param {number|null} at Deadline.
   * @param {number} renderedAt Render time.
   * @returns {string} HTML.
   */
  function deadline(at, renderedAt) {
    if (!Number.isFinite(at)) {
      return '—';
    }
    const left = at - renderedAt;
    return `${escapeHtml(formatUtc(at))}<br><span style="${S.muted}">${escapeHtml(left >= 0 ? `in ${formatDuration(left)}` : `${formatDuration(-left)} ago`)}</span>`;
  }

  /**
   * Describes what a run is waiting for.
   *
   * @param {object} inst Instance.
   * @param {string} lang Locale.
   * @returns {{text: string, at: number|null}} Wait.
   */
  function waitOf(inst, lang) {
    const wait = inst.branches.main?.wait;
    if (inst.status === STATUS.REVIEW) {
      return { text: t(`review.${inst.review?.reason}`, lang), at: null };
    }
    if (!wait) {
      return { text: '', at: null };
    }
    const at = wait.dueAt ?? wait.timeoutAt ?? null;
    return {
      text: t(`waits.${wait.kind}`, lang, { event: wait.event || '', child: wait.childId || '' }),
      at: inst.status === STATUS.PAUSED ? null : at,
    };
  }

  /**
   * Summarises a definition's triggers.
   *
   * @param {object|null} def Definition snapshot.
   * @returns {string} Text.
   */
  function triggerSummary(def) {
    return (def?.triggers || [])
      .map((tr) =>
        tr.type === 'event' ? tr.event : tr.type === 'signal' ? `signal:${tr.name}` : tr.type
      )
      .join(', ');
  }

  /**
   * Renders the dashboard HTML for a view.
   *
   * @param {string} view View name.
   * @param {number} page Page.
   * @returns {string} HTML.
   */
  function renderDashboard(view, page) {
    const s = getState();
    const lang = getConfig().language;
    const at = now();
    const nav = DASHBOARD_VIEWS.map((v) =>
      commandLink(
        t(`dashboard.views.${v}`, lang),
        ['dashboard', 'view', v],
        v === view ? S.navOn : S.btnAlt
      )
    ).join('');
    const status = runtime.disabled
      ? `<span style="${S.warn}">${escapeHtml(t('dashboard.statusDisabled', lang))}</span>`
      : s.halted
        ? `<span style="${S.warn}">${escapeHtml(t('dashboard.statusHalted', lang))}</span>`
        : `<span style="${S.ok}">${escapeHtml(t('dashboard.statusRunning', lang))}</span>`;
    const controls = [
      commandLink(t('dashboard.refresh', lang), ['dashboard', 'refresh'], S.btnAlt),
      s.halted
        ? commandLink(t('dashboard.resumeAll', lang), ['resume-all'], S.btn)
        : commandLink(t('dashboard.stopAll', lang), ['stop-all', '--preview'], S.btnDanger),
      commandLink(t('dashboard.templates', lang), ['template', 'list'], S.btnAlt),
      commandLink(t('dashboard.help', lang), ['help'], S.btnAlt),
    ].join('');
    const sections = {
      overview: renderOverview,
      definitions: renderDefinitions,
      instances: renderInstances,
      queue: renderQueue,
      incidents: renderIncidents,
      history: renderHistory,
      integrations: renderIntegrations,
    };
    const body = (sections[view] || renderOverview)(page, lang, at);
    return [
      `<div style="${S.outer}">`,
      `<div style="${S.header}"><h1 style="${S.h1}">${escapeHtml(SCRIPT_NAME)}</h1>`,
      `<p style="${S.sub}">${escapeHtml(t('dashboard.generated', lang, { at: formatUtc(at), version: SCRIPT_VERSION }))}</p></div>`,
      `<p style="${S.muted}">${escapeHtml(t('dashboard.generatedNote', lang))}</p>`,
      `<div style="margin:4px 0">${status} ${controls}</div>`,
      `<div style="margin:6px 0">${nav}</div>`,
      body,
      '</div>',
    ].join('');
  }

  /**
   * Overview: counts, runs needing a decision, top incidents and next times.
   *
   * @param {number} page Page.
   * @param {string} lang Locale.
   * @param {number} at Render time.
   * @returns {string} HTML.
   */
  function renderOverview(page, lang, at) {
    const s = getState();
    const active = listInstances((i) => ACTIVE_STATUSES.has(i.status));
    const byStatus = (status) => active.filter((i) => i.status === status).length;
    const incidents = openIncidents();
    const sched = runtime.scheduler?.stats() || {};
    const counts = [
      [
        t('dashboard.counts.definitions', lang),
        listRecords().filter((r) => r.enabled).length + ' / ' + listRecords().length,
      ],
      [t('dashboard.counts.running', lang), byStatus(STATUS.RUNNING) + byStatus(STATUS.WAITING)],
      [t('dashboard.counts.paused', lang), byStatus(STATUS.PAUSED)],
      [t('dashboard.counts.review', lang), byStatus(STATUS.REVIEW)],
      [
        t('dashboard.counts.queued', lang),
        Object.values(s.queues).reduce((n, q) => n + q.length, 0),
      ],
      [t('dashboard.counts.incidents', lang), incidents.length],
      [t('dashboard.counts.nextJob', lang), sched.nextDueAt ? formatUtc(sched.nextDueAt) : '—'],
    ].map(([label, value]) => [escapeHtml(label), escapeHtml(String(value))]);
    const review = active
      .filter((i) => i.status === STATUS.REVIEW)
      .map((inst) => instanceRow(inst, lang, at));
    const next = listSchedules()
      .filter((sc) => !sc.paused && !sc.ended && sc.cursor.nextDueAt)
      .slice(0, 5)
      .map((sc) => [
        escapeHtml(sc.id),
        escapeHtml(sc.definitionId),
        deadline(sc.cursor.nextDueAt, at),
      ]);
    return [
      `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.overview', lang))}</h2>`,
      table$1([t('dashboard.cols.item', lang), t('dashboard.cols.value', lang)], counts),
      review.length
        ? `<h2 style="${S.h2}">${escapeHtml(t('dashboard.needsDecision', lang))}</h2>`
        : '',
      table$1(instanceHeadings(lang), review),
      incidents.length
        ? `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.incidents', lang))}</h2>`
        : '',
      table$1(
        incidentHeadings(lang),
        incidents.slice(0, 5).map((i) => incidentRow(i, lang))
      ),
      next.length ? `<h2 style="${S.h2}">${escapeHtml(t('dashboard.nextTimes', lang))}</h2>` : '',
      table$1(
        [
          t('dashboard.cols.schedule', lang),
          t('dashboard.cols.definition', lang),
          t('dashboard.cols.due', lang),
        ],
        next
      ),
      warnings(lang),
    ].join('');
  }

  /**
   * Resource and circuit-breaker warnings.
   *
   * @param {string} lang Locale.
   * @returns {string} HTML.
   */
  function warnings(lang) {
    const items = [];
    const size = stateSize();
    if (size > getLimits().stateBytes * 0.75) {
      items.push(
        t('dashboard.warnState', lang, {
          kb: Math.round(size / 1024),
          max: Math.round(getLimits().stateBytes / 1024),
        })
      );
    }
    for (const record of listRecords()) {
      if (record.disabledReason === 'circuit') {
        items.push(t('dashboard.warnCircuit', lang, { id: record.id }));
      }
    }
    if (getState().dashboard.drift) {
      items.push(t('dashboard.warnDrift', lang));
    }
    return items.length
      ? `<h2 style="${S.h2}">${escapeHtml(t('dashboard.warnings', lang))}</h2>${items.map((x) => `<p style="${S.warn}">${escapeHtml(x)}</p>`).join('')}`
      : '';
  }

  /**
   * Definitions view.
   *
   * @param {number} page Page.
   * @param {string} lang Locale.
   * @param {number} at Render time.
   * @returns {string} HTML.
   */
  function renderDefinitions(page, lang, at) {
    const paged = paginate(listRecords(), page);
    const rows = paged.items.map((record) => {
      const def = getSnapshot(record.id);
      const next =
        listSchedules(record.id).find((sc) => !sc.paused && !sc.ended)?.cursor.nextDueAt ?? null;
      const actions = [
        def && record.enabled
          ? commandLink(t('buttons.start', lang), ['instance', 'start', '--definition', record.id])
          : '',
        record.enabled
          ? commandLink(
              t('buttons.disable', lang),
              ['definition', 'disable', '--id', record.id, '--rev', String(record.rev)],
              S.btnAlt
            )
          : def
            ? commandLink(
                t('buttons.enable', lang),
                ['definition', 'enable', '--id', record.id, '--rev', String(record.rev)],
                S.btnAlt
              )
            : '',
        commandLink(t('buttons.show', lang), ['definition', 'show', '--id', record.id], S.btnAlt),
      ].join('');
      const state = record.enabled
        ? t('dashboard.enabled', lang)
        : t('dashboard.disabled', lang, { reason: record.disabledReason || '—' });
      return [
        `${escapeHtml(truncate(record.name, 60))}<br><span style="${S.muted}">${escapeHtml(record.id)} r${record.current || '—'}${record.draftDirty && record.current ? ' +draft' : ''}</span>`,
        escapeHtml(state),
        escapeHtml(triggerSummary(def)),
        deadline(next, at),
        actions,
      ];
    });
    return [
      `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.definitions', lang))}</h2>`,
      rows.length
        ? table$1(
            [
              t('dashboard.cols.definition', lang),
              t('dashboard.cols.state', lang),
              t('dashboard.cols.triggers', lang),
              t('dashboard.cols.next', lang),
              '',
            ],
            rows
          )
        : `<p style="${S.p}">${escapeHtml(t('dashboard.noDefinitions', lang))}</p>`,
      pager('definitions', paged, lang),
    ].join('');
  }

  /**
   * Column headings for run rows.
   *
   * @param {string} lang Locale.
   * @returns {string[]} Headings.
   */
  function instanceHeadings(lang) {
    return [
      t('dashboard.cols.run', lang),
      t('dashboard.cols.status', lang),
      t('dashboard.cols.targets', lang),
      t('dashboard.cols.step', lang),
      t('dashboard.cols.due', lang),
      '',
    ];
  }

  /**
   * Renders one run row with its controls.
   *
   * @param {object} inst Instance.
   * @param {string} lang Locale.
   * @param {number} at Render time.
   * @returns {string[]} Cells.
   */
  function instanceRow(inst, lang, at) {
    const rev = String(inst.revision);
    const wait = waitOf(inst, lang);
    const targets = Object.values(inst.bindings).flat();
    const actions = [];
    if (inst.status === STATUS.RUNNING || inst.status === STATUS.WAITING) {
      actions.push(
        commandLink(
          t('buttons.pause', lang),
          ['instance', 'pause', '--id', inst.id, '--rev', rev],
          S.btnAlt
        )
      );
    }
    if (inst.status === STATUS.PAUSED) {
      actions.push(
        commandLink(t('buttons.resume', lang), [
          'instance',
          'resume',
          '--id',
          inst.id,
          '--rev',
          rev,
        ])
      );
    }
    if (inst.status === STATUS.REVIEW) {
      for (const decision of decisionsFor(inst)) {
        actions.push(
          commandLink(t(`decisions.${decision}`, lang), [
            'instance',
            'decide',
            '--id',
            inst.id,
            '--action',
            decision,
            '--rev',
            rev,
          ])
        );
      }
    }
    if (ACTIVE_STATUSES.has(inst.status) && inst.status !== STATUS.REVIEW) {
      actions.push(
        commandLink(
          t('buttons.cancel', lang),
          ['instance', 'cancel', '--id', inst.id, '--rev', rev],
          S.btnAlt
        )
      );
    }
    actions.push(
      commandLink(t('buttons.inspect', lang), ['instance', 'inspect', '--id', inst.id], S.btnAlt)
    );
    const late =
      inst.latenessMs > getConfig().graceMs
        ? `<br><span style="${S.muted}">${escapeHtml(t('dashboard.late', lang, { late: formatDuration(inst.latenessMs) }))}</span>`
        : '';
    return [
      `${escapeHtml(inst.id)}<br><span style="${S.muted}">${escapeHtml(inst.definitionId)} r${inst.definitionRevision}</span>`,
      `${escapeHtml(t(`statuses.${inst.status}`, lang))}${wait.text ? `<br><span style="${S.muted}">${escapeHtml(wait.text)}</span>` : ''}${late}`,
      escapeHtml(
        targets.slice(0, 3).map(targetLabel).join(', ') +
          (targets.length > 3 ? ` +${targets.length - 3}` : '')
      ),
      escapeHtml(currentStep(inst)),
      deadline(wait.at, at),
      actions.join(''),
    ];
  }

  /**
   * Lists the decisions offered for a run in review.
   *
   * @param {object} inst Instance.
   * @returns {string[]} Decisions.
   */
  function decisionsFor(inst) {
    switch (inst.review?.reason) {
      case 'overdueWait':
        return ['complete', 'skipNext', 'cancel'];
      case 'uncertainOutcome':
      case 'restartConflict':
        return ['complete', 'retry', 'skip', 'cancel'];
      default:
        return ['retry', 'skip', 'cancel'];
    }
  }

  /**
   * Runs view: everything not finished.
   *
   * @param {number} page Page.
   * @param {string} lang Locale.
   * @param {number} at Render time.
   * @returns {string} HTML.
   */
  function renderInstances(page, lang, at) {
    const order = { review: 0, paused: 1, running: 2, waiting: 3, queued: 4 };
    const active = listInstances((i) => ACTIVE_STATUSES.has(i.status)).sort(
      (a, b) => order[a.status] - order[b.status]
    );
    const paged = paginate(active, page);
    return [
      `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.instances', lang))}</h2>`,
      paged.items.length
        ? table$1(
            instanceHeadings(lang),
            paged.items.map((i) => instanceRow(i, lang, at))
          )
        : `<p style="${S.p}">${escapeHtml(t('dashboard.noRuns', lang))}</p>`,
      pager('instances', paged, lang),
    ].join('');
  }

  /**
   * Queue view.
   *
   * @param {number} page Page.
   * @param {string} lang Locale.
   * @param {number} at Render time.
   * @returns {string} HTML.
   */
  function renderQueue(page, lang, at) {
    const entries = Object.values(getState().queues).flat();
    const paged = paginate(entries, page);
    const rows = paged.items.map((e) => [
      escapeHtml(e.id),
      escapeHtml(e.definitionId),
      escapeHtml(formatUtc(e.admittedAt)),
      deadline(e.expiresAt, at),
    ]);
    return [
      `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.queue', lang))}</h2>`,
      rows.length
        ? table$1(
            [
              t('dashboard.cols.entry', lang),
              t('dashboard.cols.definition', lang),
              t('dashboard.cols.admitted', lang),
              t('dashboard.cols.expires', lang),
            ],
            rows
          )
        : `<p style="${S.p}">${escapeHtml(t('dashboard.noQueue', lang))}</p>`,
      pager('queue', paged, lang),
    ].join('');
  }

  /**
   * Column headings for incident rows.
   *
   * @param {string} lang Locale.
   * @returns {string[]} Headings.
   */
  function incidentHeadings(lang) {
    return [
      t('dashboard.cols.incident', lang),
      t('dashboard.cols.cause', lang),
      t('dashboard.cols.range', lang),
      t('dashboard.cols.count', lang),
      '',
    ];
  }

  /**
   * Renders one incident row.
   *
   * @param {object} incident Incident.
   * @param {string} lang Locale.
   * @returns {string[]} Cells.
   */
  function incidentRow(incident, lang) {
    const actions = [];
    if (incident.status === 'open') {
      actions.push(
        commandLink(
          t('buttons.acknowledge', lang),
          ['recovery', 'acknowledge', '--incident', incident.id],
          S.btnAlt
        )
      );
    }
    if (incident.kind === 'missed' && incident.proposal?.mode === 'runOnce') {
      actions.push(
        commandLink(t('buttons.recoverRun', lang), [
          'recovery',
          'preview',
          '--incident',
          incident.id,
          '--mode',
          'runOnce',
        ])
      );
      actions.push(
        commandLink(
          t('buttons.recoverSkip', lang),
          ['recovery', 'preview', '--incident', incident.id, '--mode', 'skip'],
          S.btnAlt
        )
      );
    }
    if (incident.runId) {
      actions.push(
        commandLink(
          t('buttons.inspect', lang),
          ['instance', 'inspect', '--id', incident.runId],
          S.btnAlt
        )
      );
    }
    const target = incident.scheduleId || incident.runId || incident.definitionId || '';
    const range = incident.range
      ? `${formatUtc(incident.range.from)} → ${formatUtc(incident.range.to)}`
      : '—';
    return [
      `${escapeHtml(incident.id)}<br><span style="${S.muted}">${escapeHtml(target)} · ${escapeHtml(t(`incidentStatus.${incident.status}`, lang))}</span>`,
      `${escapeHtml(t(`causes.${incident.cause}`, lang))}${incident.policy ? `<br><span style="${S.muted}">${escapeHtml(incident.policy)}</span>` : ''}`,
      escapeHtml(range),
      escapeHtml(String(incident.count)),
      actions.join(''),
    ];
  }

  /**
   * Incidents view.
   *
   * @param {number} page Page.
   * @param {string} lang Locale.
   * @returns {string} HTML.
   */
  function renderIncidents(page, lang) {
    const paged = paginate(openIncidents(), page);
    return [
      `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.incidents', lang))}</h2>`,
      paged.items.length
        ? table$1(
            incidentHeadings(lang),
            paged.items.map((i) => incidentRow(i, lang))
          )
        : `<p style="${S.p}">${escapeHtml(t('dashboard.noIncidents', lang))}</p>`,
      pager('incidents', paged, lang),
    ].join('');
  }

  /**
   * History view: recent finished runs.
   *
   * @param {number} page Page.
   * @param {string} lang Locale.
   * @returns {string} HTML.
   */
  function renderHistory(page, lang) {
    const items = [...getState().history].reverse();
    const paged = paginate(items, page);
    const rows = paged.items.map((h) => [
      `${escapeHtml(h.id)}<br><span style="${S.muted}">${escapeHtml(h.definitionId)} r${h.revision}</span>`,
      `${escapeHtml(t(`statuses.${h.status}`, lang))}${h.error ? `<br><span style="${S.muted}">${escapeHtml(truncate(t(`runErrors.${h.error.reason}`, lang, h.error.vars || {}), 120))}${h.error.stepId ? ` @ ${escapeHtml(h.error.stepId)}` : ''}</span>` : ''}`,
      escapeHtml(formatUtc(h.completedAt)),
      escapeHtml(formatDuration(h.durationMs)),
      escapeHtml(
        `${h.effects}${h.uncertain ? ` / ${t('dashboard.uncertain', lang, { count: h.uncertain })}` : ''}`
      ),
      commandLink(t('buttons.rerun', lang), ['instance', 'rerun', '--id', h.id], S.btnAlt),
    ]);
    return [
      `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.history', lang))}</h2>`,
      rows.length
        ? table$1(
            [
              t('dashboard.cols.run', lang),
              t('dashboard.cols.status', lang),
              t('dashboard.cols.finished', lang),
              t('dashboard.cols.duration', lang),
              t('dashboard.cols.effects', lang),
              '',
            ],
            rows
          )
        : `<p style="${S.p}">${escapeHtml(t('dashboard.noHistory', lang))}</p>`,
      pager('history', paged, lang),
    ].join('');
  }

  /**
   * Integrations and diagnostics view.
   *
   * @param {number} page Page.
   * @param {string} lang Locale.
   * @returns {string} HTML.
   */
  function renderIntegrations(page, lang) {
    const adapters = listAdapters().map((a) => [
      escapeHtml(a.name),
      escapeHtml(String(a.version || '')),
      escapeHtml(Object.keys(a.actions).join(', ')),
      escapeHtml(formatUtc(a.registeredAt)),
    ]);
    const stats = runtime.scheduler?.stats() || {};
    const s = getState();
    const diag = [
      ['jobs', stats.jobs],
      ['stale', stats.stale],
      ['next', stats.nextDueAt ? formatUtc(stats.nextDueAt) : '—'],
      ['armed', stats.armed ? 'yes' : 'no'],
      ['drains', stats.drains],
      ['yields', stats.yields],
      ['maxDrainMs', stats.maxDrainMs],
      ['clockJumps', stats.clockJumps],
      ['stateKb', Math.round(stateSize() / 1024)],
      ['boot', `${s.boot.id} (${formatUtc(s.boot.at)})`],
      ['admitted', s.stats.admitted],
      ['suppressed', s.stats.suppressed],
      ['dropped', s.stats.dropped],
      ['coalesced', s.stats.coalesced],
    ].map(([k, v]) => [escapeHtml(t(`dashboard.diag.${k}`, lang)), escapeHtml(String(v ?? '—'))]);
    return [
      `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.integrations', lang))}</h2>`,
      adapters.length
        ? table$1(
            [
              t('dashboard.cols.adapter', lang),
              t('dashboard.cols.version', lang),
              t('dashboard.cols.actions', lang),
              t('dashboard.cols.registered', lang),
            ],
            adapters
          )
        : `<p style="${S.p}">${escapeHtml(t('dashboard.noAdapters', lang))}</p>`,
      `<h2 style="${S.h2}">${escapeHtml(t('dashboard.diagnostics', lang))}</h2>`,
      table$1([t('dashboard.cols.item', lang), t('dashboard.cols.value', lang)], diag),
    ].join('');
  }

  /**
   * Renders the player view: only definitions published to players and the
   * status of their runs. Never GM rows hidden with styling.
   *
   * @returns {string} HTML.
   */
  function renderPlayerView() {
    const lang = getConfig().language;
    const published = listRecords().filter(
      (r) => r.enabled && getSnapshot(r.id)?.access?.mode === 'players'
    );
    const rows = published.map((r) => {
      const def = getSnapshot(r.id);
      return [
        escapeHtml(truncate(def.name, 60)),
        escapeHtml(truncate(def.description || '', 160)),
        commandLink(t('buttons.start', lang), ['instance', 'start', '--definition', r.id]),
      ];
    });
    const runs = listInstances(
      (i) =>
        ACTIVE_STATUSES.has(i.status) &&
        i.authority === 'initiator' &&
        getSnapshot(i.definitionId, i.definitionRevision)?.access?.mode === 'players'
    ).map((i) => [
      escapeHtml(i.id),
      escapeHtml(truncate(i.name, 60)),
      escapeHtml(t(`statuses.${i.status}`, lang)),
    ]);
    return [
      `<div style="${S.outer}">`,
      `<div style="${S.header}"><h1 style="${S.h1}">${escapeHtml(t('dashboard.playerTitle', lang))}</h1>`,
      `<p style="${S.sub}">${escapeHtml(t('dashboard.generated', lang, { at: formatUtc(now()), version: SCRIPT_VERSION }))}</p></div>`,
      rows.length
        ? table$1([t('dashboard.cols.task', lang), t('dashboard.cols.description', lang), ''], rows)
        : `<p style="${S.p}">${escapeHtml(t('dashboard.noPlayerTasks', lang))}</p>`,
      runs.length
        ? `<h2 style="${S.h2}">${escapeHtml(t('dashboard.activeRuns', lang))}</h2>${table$1([t('dashboard.cols.run', lang), t('dashboard.cols.task', lang), t('dashboard.cols.status', lang)], runs)}`
        : '',
      '</div>',
    ].join('');
  }

  /**
   * Returns the dashboard handout, creating it GM-only when missing. A
   * deleted handout is recreated at most once a minute.
   *
   * @returns {object|null} Handout.
   */
  function ensureDashboard() {
    const s = getState();
    let handout = s.dashboard.handoutId ? getObject('handout', s.dashboard.handoutId) : null;
    if (!handout) {
      handout = findObjects({ _type: 'handout', name: HANDOUT_DASHBOARD_NAME })[0] || null;
    }
    if (!handout) {
      const recreating = Boolean(s.dashboard.handoutId);
      // Recreate a deleted dashboard at most once a minute, so a GM deleting
      // it repeatedly does not start a create/delete loop.
      if (recreating && now() - s.dashboard.recreatedAt < TIMING.recreateHandoutMs) {
        schedule({
          kind: JOB.DASHBOARD,
          dueAt: s.dashboard.recreatedAt + TIMING.recreateHandoutMs,
          key: 'dashboard',
        });
        return null;
      }
      handout = createObject('handout', {
        name: HANDOUT_DASHBOARD_NAME,
        inplayerjournals: '',
        controlledby: '',
        archived: false,
      });
      if (recreating) {
        s.dashboard.recreatedAt = now();
      }
      s.dashboard.lastHash = null;
    }
    s.dashboard.handoutId = handout?.id || null;
    return handout;
  }

  /**
   * Checks that the dashboard is still GM-only. Permission drift stops
   * sensitive writes until the GM repairs it.
   *
   * @param {object} handout Handout.
   * @returns {boolean} True when private.
   */
  function isPrivate(handout) {
    const journals = String(handout.get('inplayerjournals') || '').trim();
    const control = String(handout.get('controlledby') || '').trim();
    const s = getState();
    if (journals || control) {
      if (!s.dashboard.drift) {
        s.dashboard.drift = { at: now(), journals, control };
        noticeGm('drift', t('notices.drift', getConfig().language));
      }
      return false;
    }
    s.dashboard.drift = null;
    return true;
  }

  /**
   * Removes player access from the dashboard after drift (GM command).
   *
   * @returns {boolean} True when repaired.
   */
  function repairDashboard() {
    const handout = ensureDashboard();
    if (!handout) {
      return false;
    }
    handout.set({ inplayerjournals: '', controlledby: '' });
    getState().dashboard.drift = null;
    // Content may be stale after the drift: write it again.
    getState().dashboard.lastHash = null;
    markDirty();
    return true;
  }

  /**
   * Marks the dashboard dirty. One job writes it: no sooner than the
   * coalescing delay, no sooner than two seconds after the last write, and
   * no later than five seconds after it first became dirty under normal load.
   *
   * @returns {void}
   */
  function markDirty() {
    if (!runtime.ready || runtime.disabled) {
      return;
    }
    const s = getState();
    const at = now();
    if (memory.dirtySince === null) {
      memory.dirtySince = at;
    }
    const earliest = Math.max(
      at + TIMING.dashboardCoalesceMs,
      (s.dashboard.lastWriteAt || 0) + TIMING.dashboardSpacingMs
    );
    const latest = Math.max(
      memory.dirtySince + TIMING.dashboardMaxDirtyMs,
      (s.dashboard.lastWriteAt || 0) + TIMING.dashboardSpacingMs
    );
    const dueAt = Math.min(earliest, latest);
    const existing = runtime.scheduler?.getKey('dashboard');
    if (existing && existing.dueAt <= dueAt) {
      return;
    }
    schedule({ kind: JOB.DASHBOARD, dueAt, key: 'dashboard' });
  }

  /**
   * Writes the dashboard (and player view) when content changed.
   *
   * @param {{force?: boolean}} [options] Write even when the hash matches.
   * @returns {void}
   */
  function flushDashboard({ force = false } = {}) {
    const s = getState();
    memory.dirtySince = null;
    memory.generation += 1;
    const handout = ensureDashboard();
    if (!handout) {
      return;
    }
    if (!isPrivate(handout)) {
      return;
    }
    const html = renderDashboard(s.dashboard.view, s.dashboard.page);
    const hash = hashText(html.replace(/Generated [^<]*/, ''));
    if (force || hash !== s.dashboard.lastHash) {
      handout.set('notes', html);
      s.dashboard.lastHash = hash;
      s.dashboard.lastWriteAt = now();
    }
    if (getConfig().playerView) {
      writePlayerView();
    }
  }

  /**
   * Writes the player view handout, visible to the players tasks are published to.
   *
   * @returns {void}
   */
  function writePlayerView() {
    const s = getState();
    let handout = s.dashboard.playerHandoutId
      ? getObject('handout', s.dashboard.playerHandoutId)
      : null;
    if (!handout) {
      handout =
        findObjects({ _type: 'handout', name: HANDOUT_PLAYER_NAME })[0] ||
        createObject('handout', {
          name: HANDOUT_PLAYER_NAME,
          inplayerjournals: '',
          controlledby: '',
        });
      s.dashboard.playerHandoutId = handout?.id || null;
    }
    if (!handout) {
      return;
    }
    const players = new Set();
    for (const record of listRecords()) {
      const access = getSnapshot(record.id)?.access;
      if (record.enabled && access?.mode === 'players') {
        for (const p of access.players || []) {
          players.add(p);
        }
      }
    }
    const journals = players.has('all') ? 'all' : [...players].join(',');
    if (handout.get('inplayerjournals') !== journals) {
      handout.set('inplayerjournals', journals);
    }
    const html = renderPlayerView();
    const hash = hashText(html.replace(/Generated [^<]*/, ''));
    if (hash !== s.dashboard.playerHash) {
      handout.set('notes', html);
      s.dashboard.playerHash = hash;
    }
  }

  /**
   * Handles a deleted handout: the dashboard is recreated on the next write.
   *
   * @param {object} obj Destroyed handout.
   * @returns {void}
   */
  function onHandoutDestroyed(obj) {
    const s = getState();
    if (obj.id === s.dashboard.handoutId) {
      logLine('dashboard handout deleted; it will be recreated');
      s.dashboard.lastHash = null;
      markDirty();
    }
    if (obj.id === s.dashboard.playerHandoutId) {
      s.dashboard.playerHandoutId = null;
    }
  }

  /**
   * Changes the shared dashboard view.
   *
   * @param {string} view View.
   * @param {number} page Page.
   * @returns {boolean} True when the view exists.
   */
  function setView(view, page = 1) {
    if (!DASHBOARD_VIEWS.includes(view)) {
      return false;
    }
    const s = getState();
    s.dashboard.view = view;
    s.dashboard.page = Math.max(1, page);
    markDirty();
    return true;
  }

  /**
   * Returns a link to open the dashboard handout from chat.
   *
   * @returns {string|null} URL.
   */
  function dashboardUrl() {
    const id = getState().dashboard.handoutId;
    return id ? `http://journal.roll20.net/handout/${id}` : null;
  }

  /**
   * Whispers a short, rate-limited notice to the GM with a dashboard link.
   * Routine history stays in the dashboard; chat stays quiet.
   *
   * @param {string} kind Notice kind (one per kind per minute).
   * @param {string} text Text.
   * @returns {void}
   */
  function noticeGm(kind, text) {
    const at = now();
    const last = memory.notices.get(kind) || 0;
    if (at - last < TIMING.recoverySummaryMs) {
      return;
    }
    memory.notices.set(kind, at);
    const url = dashboardUrl();
    const link = url
      ? ` <a href="${escapeHtml(url)}" style="${S.btnAlt}">${escapeHtml(t('buttons.dashboard', getConfig().language))}</a>`
      : '';
    whisper(null, SCRIPT_NAME, `<div>${escapeHtml(text)}${link}</div>`);
  }

  /**
   * Registers the dashboard job handler.
   *
   * @returns {void}
   */
  function registerDashboardJobs() {
    onJob(JOB.DASHBOARD, () => flushDashboard());
  }

  // Ready-made task definitions: the plan's montage fixture and the seven
  // worked examples (plan §12.2, §12.4). `npm run examples` writes each one to
  // examples/<id>.json so they can be imported into any game.

  const base = (id, name, description) => ({
    schemaVersion: 1,
    id,
    revision: 1,
    name,
    description,
    enabled: true,
    parameters: {},
  });

  const TEMPLATES = [
    {
      ...base(
        'montage',
        'Adventure montage',
        'Cycle selected multi-sided tokens ten times, eight seconds apart.'
      ),
      bindings: { tokens: { from: 'selected', objectType: 'graphic', max: 5 } },
      access: { mode: 'gmOnly', authority: 'initiator' },
      triggers: [{ id: 'manual', type: 'manual' }],
      policy: {
        concurrency: 'skipIfRunning',
        maxConcurrent: 1,
        onError: 'fail',
        overdue: { mode: 'skip', graceMs: 250 },
        restart: 'reconcile',
      },
      steps: [
        {
          id: 'frames',
          type: 'loop',
          mode: 'count',
          count: 10,
          steps: [
            {
              id: 'advance',
              type: 'token.advanceSide',
              target: { binding: 'tokens' },
              delta: 1,
              wrap: true,
            },
            { id: 'hold', type: 'wait', durationMs: 8000 },
          ],
        },
      ],
    },
    {
      ...base(
        'torch-reminder',
        'Torch reminder',
        'Warn the torchbearer after 50 real-world minutes and put the torch out 10 minutes later. Real minutes, not game time.'
      ),
      bindings: { torchbearer: { from: 'selected', objectType: 'graphic', max: 1 } },
      access: { mode: 'gmOnly', authority: 'initiator' },
      triggers: [{ id: 'manual', type: 'manual' }],
      policy: { concurrency: 'allow', maxConcurrent: 10, onError: 'fail', restart: 'reconcile' },
      steps: [
        { id: 'burn', type: 'wait', durationMs: 50 * 60 * 1000, overdue: 'review' },
        {
          id: 'warn',
          type: 'chat.send',
          mode: 'whisper',
          to: { gm: true, controllers: 'torchbearer' },
          text: "{{target.torchbearer.name}}'s torch is guttering: about 10 minutes of light left.",
        },
        { id: 'last-light', type: 'wait', durationMs: 10 * 60 * 1000, overdue: 'review' },
        {
          id: 'out',
          type: 'chat.send',
          mode: 'say',
          text: "{{target.torchbearer.name}}'s torch burns out.",
        },
      ],
    },
    {
      ...base(
        'hp-zero',
        'HP threshold',
        "When a token's bar 1 drops from above 0 to 0 or less, mark it dead and tell the GM."
      ),
      enabled: false,
      bindings: { token: { from: 'event', objectType: 'graphic', max: 1 } },
      access: { mode: 'gmOnly', authority: 'gmService' },
      triggers: [
        {
          id: 'bar-crossing',
          type: 'event',
          event: 'token.change',
          filter: {
            properties: ['bar1_value'],
            crossing: { property: 'bar1_value', direction: 'below', threshold: 0 },
          },
          bind: { binding: 'token' },
          cooldownMs: 1000,
        },
      ],
      policy: { concurrency: 'allow', maxConcurrent: 10, onError: 'skip' },
      steps: [
        { id: 'mark', type: 'marker.set', target: { binding: 'token' }, marker: 'dead', op: 'add' },
        {
          id: 'tell',
          type: 'chat.send',
          mode: 'whisper',
          to: { gm: true },
          text: '{{target.token.name}} has dropped to {{event.new.bar1_value}} HP.',
        },
      ],
    },
    {
      ...base(
        'turn-response',
        'Turn response',
        'When the current turn changes to a token, wait briefly for an optional ready signal, then ping it for the GM.'
      ),
      enabled: false,
      bindings: { token: { from: 'event', objectType: 'graphic', max: 1, min: 0 } },
      access: { mode: 'gmOnly', authority: 'gmService' },
      triggers: [{ id: 'turn', type: 'event', event: 'turn.change', bind: { binding: 'token' } }],
      policy: { concurrency: 'replace', maxConcurrent: 1, onError: 'skip' },
      steps: [
        {
          id: 'has-token',
          type: 'if',
          condition: { op: 'gt', left: { ref: 'target.token.count' }, right: 0 },
          then: [
            {
              id: 'ready',
              type: 'awaitEvent',
              event: 'signal',
              filter: { signal: 'turn-ready' },
              timeoutMs: 15000,
            },
            { id: 'ping', type: 'ping', target: { binding: 'token' }, to: { gm: true } },
            {
              id: 'notify',
              type: 'chat.send',
              mode: 'whisper',
              to: { gm: true },
              text: "It is {{target.token.name}}'s turn.",
            },
          ],
          else: [
            {
              id: 'notify-custom',
              type: 'chat.send',
              mode: 'whisper',
              to: { gm: true },
              text: 'Turn: {{event.name}}',
            },
          ],
        },
      ],
    },
    {
      ...base(
        'scene-cleanup',
        'Scene cleanup',
        'Stop a jukebox track and announce the scene is over. Called by Parallel scene.'
      ),
      parameters: { track: { type: 'string', required: true, maxLength: 100 } },
      bindings: {},
      access: { mode: 'gmOnly', authority: 'initiator' },
      triggers: [{ id: 'manual', type: 'manual' }],
      policy: { concurrency: 'allow', maxConcurrent: 5, onError: 'skip' },
      steps: [
        { id: 'silence', type: 'audio.control', track: '{{param.track}}', op: 'stop' },
        { id: 'done', type: 'chat.send', mode: 'desc', text: 'The scene falls quiet.' },
      ],
    },
    {
      ...base(
        'parallel-scene',
        'Parallel scene',
        'Fade the "Ambience" jukebox track in steps while a door token changes after a wait; when both finish, chain Scene cleanup.'
      ),
      parameters: { track: { type: 'string', default: 'Ambience', maxLength: 100 } },
      bindings: { door: { from: 'selected', objectType: 'graphic', max: 1 } },
      access: { mode: 'gmOnly', authority: 'initiator' },
      triggers: [{ id: 'manual', type: 'manual' }],
      policy: {
        concurrency: 'skipIfRunning',
        maxConcurrent: 1,
        onError: 'fail',
        restart: 'reconcile',
      },
      steps: [
        {
          id: 'scene',
          type: 'parallel',
          join: 'all',
          branches: [
            {
              id: 'music',
              steps: [
                {
                  id: 'fade',
                  type: 'loop',
                  mode: 'count',
                  count: 5,
                  steps: [
                    {
                      id: 'volume',
                      type: 'audio.control',
                      track: '{{param.track}}',
                      op: 'volume',
                      volume: {
                        op: 'sub',
                        left: 60,
                        right: { op: 'mul', left: { ref: 'run.iteration' }, right: 10 },
                      },
                      onError: 'skip',
                    },
                    { id: 'fade-step', type: 'wait', durationMs: 1000 },
                  ],
                },
              ],
            },
            {
              id: 'door',
              steps: [
                { id: 'door-wait', type: 'wait', durationMs: 3000 },
                {
                  id: 'door-open',
                  type: 'token.advanceSide',
                  target: { binding: 'door' },
                  delta: 1,
                  wrap: true,
                },
              ],
            },
          ],
        },
        {
          id: 'cleanup',
          type: 'call',
          definition: 'scene-cleanup',
          await: true,
          params: { track: { ref: 'param.track' } },
        },
      ],
    },
    {
      ...base(
        'session-reminder',
        'Session reminder',
        'Every Friday at 19:00 (UTC+00:00) remind the table that the session starts soon. Update the offset when the clocks change.'
      ),
      enabled: false,
      bindings: {},
      access: { mode: 'gmOnly', authority: 'gmService' },
      triggers: [
        {
          id: 'weekly',
          type: 'weekly',
          days: ['fri'],
          time: '19:00',
          offset: '+00:00',
          overdue: { mode: 'runOnce', windowMs: 15 * 60 * 1000, maxAgeMs: 2 * 60 * 60 * 1000 },
        },
      ],
      policy: {
        concurrency: 'skipIfRunning',
        maxConcurrent: 1,
        onError: 'skip',
        lifetimeMs: 60 * 60 * 1000,
      },
      steps: [
        {
          id: 'remind',
          type: 'chat.send',
          mode: 'say',
          text: 'Session starts in 15 minutes. Grab your dice!',
        },
      ],
    },
    {
      ...base(
        'token-mod-command',
        'Other-Mod command',
        'Send an approved TokenMod command for the selected token, by ID. Shown as dispatched, not confirmed.'
      ),
      bindings: { token: { from: 'selected', objectType: 'graphic', max: 1 } },
      access: { mode: 'gmOnly', authority: 'initiator' },
      triggers: [{ id: 'manual', type: 'manual' }],
      policy: { concurrency: 'allow', maxConcurrent: 5, onError: 'fail' },
      steps: [
        {
          id: 'mark-blue',
          type: 'integration.command',
          command: '!token-mod --ids {{args.token}} --set statusmarkers|+blue',
          args: { token: { ref: 'target.token.id' } },
        },
      ],
    },
    {
      ...base(
        'door-sequence',
        'Door sequence',
        'Announce a door, wait up to a minute for the door-open signal, then open it or report that it stayed shut.'
      ),
      bindings: { door: { from: 'selected', objectType: 'graphic', max: 1 } },
      access: { mode: 'gmOnly', authority: 'initiator' },
      triggers: [{ id: 'manual', type: 'manual' }],
      policy: {
        concurrency: 'skipIfRunning',
        maxConcurrent: 1,
        onError: 'fail',
        restart: 'reconcile',
      },
      steps: [
        {
          id: 'announce',
          type: 'chat.send',
          mode: 'say',
          text: 'The heavy door groans. Someone must pull the lever...',
        },
        {
          id: 'lever',
          type: 'awaitEvent',
          event: 'signal',
          filter: { signal: 'door-open' },
          timeoutMs: 60000,
          saveAs: 'lever',
        },
        {
          id: 'opened',
          type: 'if',
          condition: { ref: 'var.lever.matched' },
          then: [
            {
              id: 'swing',
              type: 'token.advanceSide',
              target: { binding: 'door' },
              delta: 1,
              wrap: false,
            },
            { id: 'open-msg', type: 'chat.send', mode: 'say', text: 'The door swings open.' },
          ],
          else: [{ id: 'shut-msg', type: 'chat.send', mode: 'say', text: 'The door stays shut.' }],
        },
      ],
    },
  ];

  // Templates that need another template installed first.
  const TEMPLATE_DEPENDENCIES = { 'parallel-scene': ['scene-cleanup'] };

  /**
   * Returns a template by ID.
   *
   * @param {string} id Template ID.
   * @returns {object|null} Template definition.
   */
  function getTemplate(id) {
    return TEMPLATES.find((tpl) => tpl.id === id) || null;
  }

  // Trigger router (plan §6): one set of native subscriptions registered after
  // ready, normalised event envelopes, indexed filters, cooldown/debounce/burst
  // controls, awaited events, signals, self-echo suppression and opt-in
  // offline reconciliation.

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
  function definitionsChanged() {
    triggerIndex = null;
  }

  /**
   * Marks the awaited-event index stale (a run started or stopped waiting).
   *
   * @returns {void}
   */
  function awaitsChanged() {
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
  function noteOwnWrite(objectId, changes) {
    recentWrites.set(objectId, {
      changes: clone(changes),
      until: now() + getLimits().echoWindowMs,
    });
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
      src
        ? { current: src.current ?? src.get?.('current'), max: src.max ?? src.get?.('max') }
        : null;
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
  function parseTurnOrder(raw) {
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
  function registerNativeHandlers(guarded) {
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
  function emitInternal(fields) {
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
  function routeEvent(event) {
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
  function matchFilter(filter, event, scope = {}) {
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
  function raiseSignal(name, value, actor, source = 'command') {
    const event = envelope({ type: 'signal', name, value: value ?? null, actor, source });
    routeEvent(event);
  }

  /**
   * Lists the signal names players may raise.
   *
   * @returns {Set<string>} Names.
   */
  function playerSignals() {
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
  function reconcileBaselines() {
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
   * Registers the router's job handlers.
   *
   * @returns {void}
   */
  function registerTriggerJobs() {
    onJob(JOB.DEBOUNCE, onDebounce);
    onJob('internalEvents', drainInternal);
  }

  /**
   * Re-creates debounce jobs from persisted trigger state after a restart.
   *
   * @returns {void}
   */
  function rebuildTriggerJobs() {
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

  // Command controller (plan §13): `!taskautomation <resource> <verb> [options]`.
  // Authenticates the real sender, applies size and rate limits, parses an
  // allowlisted grammar, checks revisions and confirmations, then calls the
  // services. Replies are short private whispers; detail lives in the dashboard.

  /**
   * Returns the GM-facing language.
   *
   * @returns {string} Locale.
   */
  function lang() {
    return getLocale(getState()?.config?.language);
  }

  /**
   * Builds a command string from words.
   *
   * @param {...string} words Words after the prefix.
   * @returns {string} Command.
   */
  function cmd(...words) {
    return [COMMAND, ...words.map((w) => quoteArg(w))].join(' ');
  }

  /**
   * Whispers a translated error with an optional hint.
   *
   * @param {string} playerId Player.
   * @param {string} code Error key under `errors.`.
   * @param {object} [vars] Values.
   * @returns {void}
   */
  function fail(playerId, code, vars = {}) {
    const hintKey = `hints.${code}`;
    const hint = t(hintKey, lang(), vars);
    whisperError(playerId, t(`errors.${code}`, lang(), vars), hint === hintKey ? undefined : hint);
  }

  /**
   * Whispers a short success line, with optional buttons.
   *
   * @param {string} playerId Player.
   * @param {string} text Text.
   * @param {string[]} [buttons] Button HTML.
   * @returns {void}
   */
  function ok(playerId, text, buttons = []) {
    whisper(
      playerId,
      SCRIPT_NAME,
      `<div>${escapeHtml(text)}</div>${buttons.length ? `<div style="margin-top:3px">${buttons.join('')}</div>` : ''}`
    );
  }

  /**
   * Reports a service result: success text or the translated error.
   *
   * @param {string} playerId Player.
   * @param {{ok: boolean, error?: string, vars?: object}} result Result.
   * @param {string} successText Text on success.
   * @param {string[]} [buttons] Buttons on success.
   * @returns {boolean} result.ok.
   */
  function report(playerId, result, successText, buttons) {
    if (!result.ok) {
      fail(playerId, result.error || result.reason || 'internal', result.vars || {});
      return false;
    }
    ok(playerId, successText, buttons);
    return true;
  }

  /**
   * Parses `--name value` options against an allowlist. Unknown options fail
   * with help rather than being ignored.
   *
   * @param {{text: string, quoted: boolean}[]} words Words.
   * @param {object} spec Option kinds: 'value' | 'flag' | 'multi'.
   * @returns {{opts?: object, positional?: string[], error?: string, vars?: object}} Parsed.
   */
  function parseOptions(words, spec) {
    const opts = {};
    const positional = [];
    for (let i = 0; i < words.length; i += 1) {
      const word = words[i];
      if (!word.quoted && word.text.startsWith('--')) {
        const name = word.text.slice(2);
        const kind = spec[name];
        if (!kind) {
          return { error: 'unknownOption', vars: { option: word.text } };
        }
        if (kind === 'flag') {
          opts[name] = true;
          continue;
        }
        const next = words[i + 1];
        if (!next || (!next.quoted && next.text.startsWith('--'))) {
          return { error: 'missingValue', vars: { option: word.text } };
        }
        i += 1;
        if (kind === 'multi') {
          (opts[name] = opts[name] || []).push(next.text);
        } else {
          opts[name] = next.text;
        }
      } else {
        positional.push(word.text);
      }
    }
    return { opts, positional };
  }

  /**
   * Parses an optional `--rev` value.
   *
   * @param {object} opts Options.
   * @returns {number|undefined|null} Revision, undefined when absent, null when invalid.
   */
  function revOf(opts) {
    if (opts.rev === undefined) {
      return undefined;
    }
    const rev = parseStrictInt(opts.rev);
    return rev === null || rev < 1 ? null : rev;
  }

  /**
   * Parses repeated `name=value` options.
   *
   * @param {string[]|undefined} list Values.
   * @returns {object|null} Map, or null when malformed.
   */
  function pairs(list) {
    const out = {};
    for (const item of list || []) {
      const at = item.indexOf('=');
      if (at < 1) {
        return null;
      }
      out[item.slice(0, at)] = item.slice(at + 1);
    }
    return out;
  }

  /**
   * Returns the selected object IDs from a command message.
   *
   * @param {object} msg Chat message.
   * @returns {string[]} IDs.
   */
  function selectedIds(msg) {
    return (Array.isArray(msg.selected) ? msg.selected : [])
      .map((s) => s?._id)
      .filter((id) => typeof id === 'string');
  }

  // ---------------------------------------------------------------------------
  // Entry
  // ---------------------------------------------------------------------------

  /**
   * Handles a chat message. Only exactly `!taskautomation` is accepted, so
   * `!taskautomationx` or `!task` never reach this Mod.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {void}
   */
  function handleInput(msg) {
    if (msg.type !== 'api') {
      return;
    }
    const content = String(msg.content ?? '');
    const prefix = content.split(/\s/, 1)[0];
    if (prefix.toLowerCase() !== COMMAND) {
      return;
    }
    const playerId = msg.playerid;
    // API-origin messages are never a person, whatever name they show.
    if (!playerId || playerId === 'API') {
      return;
    }
    if (byteLength(content) > getLimits().payloadBytes) {
      fail(playerId, 'tooLarge', { max: getLimits().payloadBytes });
      return;
    }
    if (!allowCommand(playerId)) {
      fail(playerId, 'rateLimited');
      return;
    }
    if (runtime.disabled && isGm(playerId)) {
      fail(playerId, 'modDisabled', { reason: runtime.disabled.status });
      return;
    }
    const parsed = tokenize(content.slice(prefix.length));
    if (parsed.error) {
      fail(playerId, parsed.error);
      return;
    }
    try {
      route(msg, playerId, parsed.words, parsed.json);
      getState().boot.lastObservedAt = now();
    } catch (err) {
      logLine(`ERROR handling "${truncate(content, 200)}": ${err?.message || err}`);
      if (err?.stack) {
        log(err.stack);
      }
      fail(playerId, 'internal');
    }
  }

  const PLAYER_ROUTES = new Set(['help', 'instance', 'signal']);

  /**
   * Routes a parsed command.
   *
   * @param {object} msg Message.
   * @param {string} playerId Real sender ID.
   * @param {{text: string, quoted: boolean}[]} words Words.
   * @param {string|null} json Raw `--json` payload.
   * @returns {void}
   */
  function route(msg, playerId, words, json) {
    const gm = isGm(playerId);
    const resource = (words[0]?.text || '').toLowerCase();
    if (!gm && !PLAYER_ROUTES.has(resource)) {
      fail(playerId, 'gmOnly');
      return;
    }
    const rest = words.slice(1);
    switch (resource) {
      case '':
      case 'menu':
      case 'status':
        showMenu(playerId);
        return;
      case 'help':
        showHelp(playerId, gm);
        return;
      case 'dashboard':
        return commandDashboard(playerId, rest);
      case 'definition':
        return commandDefinition(msg, playerId, rest, json);
      case 'template':
        return commandTemplate(playerId, rest);
      case 'instance':
        return commandInstance(msg, playerId, rest, gm);
      case 'schedule':
        return commandSchedule(playerId, rest);
      case 'signal':
        return commandSignal(playerId, rest, gm);
      case 'report':
        return commandReport(playerId, rest);
      case 'recovery':
        return commandRecovery(playerId, rest);
      case 'config':
        return commandConfig(playerId, rest);
      case 'adapter':
        return commandAdapter(playerId);
      case 'stop-all':
        return commandStopAll(playerId, rest);
      case 'resume-all':
        return commandResumeAll(playerId);
      default:
        fail(playerId, 'unknownCommand', { command: resource });
    }
  }

  // ---------------------------------------------------------------------------
  // Menu and help
  // ---------------------------------------------------------------------------

  /**
   * Shows the main menu.
   *
   * @param {string} playerId Player.
   * @returns {void}
   */
  function showMenu(playerId) {
    const l = lang();
    const s = getState();
    const active = listInstances((i) => ACTIVE_STATUSES.has(i.status));
    const status = runtime.disabled
      ? t('dashboard.statusDisabled', l)
      : s.halted
        ? t('dashboard.statusHalted', l)
        : t('dashboard.statusRunning', l);
    const url = dashboardUrl();
    const lines = [
      buildRow(t('menu.status', l), escapeHtml(status)),
      buildRow(t('menu.definitions', l), escapeHtml(String(listRecords().length))),
      buildRow(t('menu.active', l), escapeHtml(String(active.length))),
      buildRow(
        t('menu.review', l),
        escapeHtml(String(active.filter((i) => i.status === STATUS.REVIEW).length))
      ),
      buildRow(t('menu.incidents', l), escapeHtml(String(openIncidents().length))),
      buildDivider(),
      url
        ? `<a href="${escapeHtml(url)}" style="display:inline-block;margin:1px 2px">${escapeHtml(t('buttons.dashboard', l))}</a>`
        : '',
      buildButton(t('buttons.refresh', l), cmd('dashboard', 'open')),
      buildButton(t('buttons.definitions', l), cmd('definition', 'list')),
      buildButton(t('buttons.runs', l), cmd('instance', 'list')),
      buildButton(t('buttons.templates', l), cmd('template', 'list')),
      buildSecondaryButton(t('buttons.incidents', l), cmd('report', 'missed')),
      buildSecondaryButton(t('buttons.help', l), cmd('help')),
      buildSecondaryButton(
        s.halted ? t('dashboard.resumeAll', l) : t('dashboard.stopAll', l),
        s.halted ? cmd('resume-all') : cmd('stop-all', '--preview')
      ),
    ];
    whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
  }

  /**
   * Shows command help. Players see only the commands they may use.
   *
   * @param {string} playerId Player.
   * @param {boolean} gm Whether the caller is a GM.
   * @returns {void}
   */
  function showHelp(playerId, gm) {
    const l = lang();
    const keys = gm
      ? HELP_COMMANDS
      : HELP_COMMANDS.filter(([, key]) =>
          ['help', 'instanceStart', 'instance', 'signal'].includes(key)
        );
    const rows = keys.map(
      ([text, key]) =>
        `<div style="margin:2px 0"><code>${escapeHtml(`${COMMAND} ${text}`.trim())}</code><br><span style="font-size:0.85em">${escapeHtml(t(`help.${key}`, l))}</span></div>`
    );
    whisper(playerId, t('titles.help', l), rows);
  }

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------

  /**
   * `dashboard open|refresh|view|repair`.
   *
   * @param {string} playerId Player.
   * @param {object[]} words Words.
   * @returns {void}
   */
  function commandDashboard(playerId, words) {
    const verb = (words[0]?.text || 'open').toLowerCase();
    const l = lang();
    switch (verb) {
      case 'open': {
        ensureDashboard();
        flushDashboard({ force: true });
        const url = dashboardUrl();
        whisper(
          playerId,
          SCRIPT_NAME,
          url
            ? `<a href="${escapeHtml(url)}">${escapeHtml(t('buttons.dashboard', l))}</a>`
            : escapeHtml(t('errors.dashboardMissing', l))
        );
        return;
      }
      case 'refresh':
        markDirty();
        ok(playerId, t('messages.dashboardRefresh', l));
        return;
      case 'view': {
        const page = words[2] ? parseStrictInt(words[2].text) : 1;
        if (!setView(words[1]?.text || '', page || 1)) {
          fail(playerId, 'badView', {
            views: 'overview, definitions, instances, queue, incidents, history, integrations',
          });
        }
        return;
      }
      case 'repair':
        report(
          playerId,
          { ok: repairDashboard(), error: 'dashboardMissing' },
          t('messages.dashboardRepaired', l)
        );
        return;
      default:
        fail(playerId, 'unknownCommand', { command: `dashboard ${verb}` });
    }
  }

  // ---------------------------------------------------------------------------
  // Definitions
  // ---------------------------------------------------------------------------

  /**
   * Formats validation errors for chat.
   *
   * @param {object[]} errors Errors.
   * @returns {string} HTML.
   */
  function formatErrors(errors) {
    const l = lang();
    return errors
      .slice(0, 15)
      .map(
        (e) =>
          `<div style="font-size:0.9em">• <strong>${escapeHtml(describePath(e.path))}</strong>: ${escapeHtml(t(`validation.${e.code}`, l, e.vars || {}))}</div>`
      )
      .join('');
  }

  /**
   * `definition …` commands.
   *
   * @param {object} msg Message.
   * @param {string} playerId GM.
   * @param {object[]} words Words.
   * @param {string|null} json JSON payload.
   * @returns {void}
   */
  function commandDefinition(msg, playerId, words, json) {
    const verb = (words[0]?.text || 'list').toLowerCase();
    const sub = (words[1]?.text || '').toLowerCase();
    const nested = ['step', 'trigger', 'import'].includes(verb) && sub && !sub.startsWith('--');
    const parsed = parseOptions(words.slice(nested ? 2 : 1), {
      id: 'value',
      name: 'value',
      rev: 'value',
      'new-id': 'value',
      field: 'value',
      value: 'value',
      step: 'value',
      trigger: 'value',
      block: 'value',
      index: 'value',
      after: 'value',
      parts: 'value',
      n: 'value',
      preview: 'flag',
      confirm: 'value',
      replace: 'flag',
      draft: 'flag',
      handout: 'flag',
      archived: 'flag',
      remove: 'flag',
    });
    if (parsed.error) {
      fail(playerId, parsed.error, parsed.vars);
      return;
    }
    const { opts } = parsed;
    const l = lang();
    const rev = revOf(opts);
    if (rev === null) {
      fail(playerId, 'badRev');
      return;
    }
    const needId = () => {
      if (!opts.id || !getRecord(opts.id)) {
        fail(playerId, 'definitionNotFound', { id: opts.id || '' });
        return false;
      }
      return true;
    };
    switch (verb) {
      case 'list':
        return listDefinitions(playerId, Boolean(opts.archived));
      case 'show':
        if (needId()) {
          showDefinition(playerId, opts.id);
        }
        return;
      case 'create': {
        const name = String(opts.name || '').trim();
        if (!name || name.length > getLimits().nameLength) {
          fail(playerId, 'badName', { max: getLimits().nameLength });
          return;
        }
        const id = opts.id || freeId(name);
        const result = createRecord(blankDefinition(id, name), playerId);
        if (
          report(playerId, result, t('messages.definitionCreated', l, { id, name }), [
            buildButton(t('buttons.show', l), cmd('definition', 'show', '--id', id)),
          ])
        ) {
          markDirty();
        }
        return;
      }
      case 'validate': {
        if (!needId()) {
          return;
        }
        const record = getRecord(opts.id);
        const check = validateBody({ ...clone(record.draft || getSnapshot(opts.id)), id: opts.id });
        const warnings = check.warnings.length
          ? `<div style="margin-top:3px">${formatErrors(check.warnings)}</div>`
          : '';
        if (check.ok) {
          whisper(
            playerId,
            t('titles.validation', l),
            `<div>${escapeHtml(t('messages.valid', l, { id: opts.id }))}</div>${warnings}${buildButton(t('buttons.publish', l), cmd('definition', 'publish', '--id', opts.id, '--rev', String(record.rev)))}`
          );
        } else {
          whisper(
            playerId,
            t('titles.validation', l),
            `<div>${escapeHtml(t('messages.invalid', l, { id: opts.id, count: check.errors.length }))}</div>${formatErrors(check.errors)}${warnings}`
          );
        }
        return;
      }
      case 'publish': {
        if (!needId()) {
          return;
        }
        const result = publish(opts.id, playerId, rev);
        if (!result.ok && result.errors) {
          whisper(
            playerId,
            t('titles.validation', l),
            `<div>${escapeHtml(t('messages.invalid', l, { id: opts.id, count: result.errors.length }))}</div>${formatErrors(result.errors)}`
          );
          return;
        }
        report(
          playerId,
          result,
          t('messages.published', l, { id: opts.id, revision: result.revision }),
          [buildButton(t('buttons.start', l), cmd('instance', 'start', '--definition', opts.id))]
        );
        return;
      }
      case 'enable':
      case 'disable':
        if (needId()) {
          report(
            playerId,
            setEnabled(opts.id, verb === 'enable', playerId, { expectedRev: rev }),
            t(verb === 'enable' ? 'messages.enabled' : 'messages.disabled', l, { id: opts.id })
          );
        }
        return;
      case 'clone': {
        if (!needId()) {
          return;
        }
        const name = String(opts.name || `${getRecord(opts.id).name} (copy)`).slice(
          0,
          getLimits().nameLength
        );
        const result = cloneRecord(opts.id, name, playerId, opts['new-id']);
        report(
          playerId,
          result,
          t('messages.cloned', l, { id: result.record?.id || '', name }),
          result.record
            ? [
                buildButton(
                  t('buttons.show', l),
                  cmd('definition', 'show', '--id', result.record.id)
                ),
              ]
            : []
        );
        return;
      }
      case 'archive':
        if (needId()) {
          report(
            playerId,
            archiveRecord(opts.id, playerId),
            t('messages.archived', l, { id: opts.id })
          );
        }
        return;
      case 'purge':
        return purgeCommand(playerId, opts);
      case 'export':
        if (needId()) {
          exportCommand(playerId, opts);
        }
        return;
      case 'import':
        return importCommand(playerId, nested ? sub : '', opts, json);
      case 'set':
        if (needId()) {
          setField(playerId, opts, rev);
        }
        return;
      case 'param':
      case 'binding':
        if (needId()) {
          editMapEntry(playerId, verb === 'param' ? 'parameters' : 'bindings', opts, json, rev);
        }
        return;
      case 'access':
      case 'policy':
        if (needId()) {
          editObject(playerId, verb, json, rev, opts.id);
        }
        return;
      case 'trigger':
        if (needId()) {
          editTrigger(playerId, sub, opts, json, rev);
        }
        return;
      case 'step':
        if (needId()) {
          editStep(playerId, sub, opts, json, rev);
        }
        return;
      default:
        fail(playerId, 'unknownCommand', { command: `definition ${verb}` });
    }
  }

  /**
   * Lists definitions.
   *
   * @param {string} playerId GM.
   * @param {boolean} archived Include archived.
   * @returns {void}
   */
  function listDefinitions(playerId, archived) {
    const l = lang();
    const records = listRecords({ archived });
    if (!records.length) {
      whisper(
        playerId,
        t('titles.definitions', l),
        `<div>${escapeHtml(t('dashboard.noDefinitions', l))}</div>${buildButton(t('buttons.templates', l), cmd('template', 'list'))}`
      );
      return;
    }
    const rows = records.slice(0, 40).map((r) => {
      const state = r.enabled ? '✓' : '✗';
      return `<div style="margin:2px 0">${state} <strong>${escapeHtml(truncate(r.name, 40))}</strong> <span style="font-size:0.85em">${escapeHtml(r.id)} r${r.current || '—'}</span> ${buildSecondaryButton('⋯', cmd('definition', 'show', '--id', r.id))}${r.enabled ? buildButton(t('buttons.start', l), cmd('instance', 'start', '--definition', r.id)) : ''}</div>`;
    });
    whisper(playerId, t('titles.definitions', l), rows);
  }

  /**
   * Outlines steps for a definition card.
   *
   * @param {object[]} steps Steps.
   * @param {number} depth Indent.
   * @param {string[]} out Lines.
   * @returns {void}
   */
  function outline(steps, depth, out) {
    for (const step of steps || []) {
      if (out.length >= 40) {
        return;
      }
      out.push(
        `<div style="margin-left:${depth * 12}px;font-size:0.88em">${escapeHtml(step.id)} <span style="opacity:0.7">${escapeHtml(step.type)}</span></div>`
      );
      outline(step.steps, depth + 1, out);
      if (step.then?.length) {
        out.push(
          `<div style="margin-left:${(depth + 1) * 12}px;font-size:0.8em;opacity:0.7">then</div>`
        );
        outline(step.then, depth + 2, out);
      }
      if (step.else?.length) {
        out.push(
          `<div style="margin-left:${(depth + 1) * 12}px;font-size:0.8em;opacity:0.7">else</div>`
        );
        outline(step.else, depth + 2, out);
      }
      for (const branch of step.branches || []) {
        out.push(
          `<div style="margin-left:${(depth + 1) * 12}px;font-size:0.8em;opacity:0.7">${escapeHtml(branch.id)}</div>`
        );
        outline(branch.steps, depth + 2, out);
      }
    }
  }

  /**
   * Shows a definition card with its controls.
   *
   * @param {string} playerId GM.
   * @param {string} id Definition ID.
   * @returns {void}
   */
  function showDefinition(playerId, id) {
    const l = lang();
    const record = getRecord(id);
    const body = record.draft || getSnapshot(id);
    const rev = String(record.rev);
    const steps = [];
    outline(body.steps, 0, steps);
    const draftAhead = Boolean(record.draftDirty);
    const schedules = listSchedules(id).map(
      (sc) =>
        `${sc.id}: ${sc.paused ? t('statuses.paused', l) : sc.cursor.nextDueAt ? formatUtc(sc.cursor.nextDueAt) : '—'}`
    );
    const lines = [
      buildRow(t('labels.id', l), escapeHtml(id)),
      buildRow(
        t('labels.revision', l),
        escapeHtml(`${record.current || '—'}${draftAhead ? ` (${t('labels.draft', l)})` : ''}`)
      ),
      buildRow(
        t('labels.enabled', l),
        escapeHtml(
          record.enabled
            ? t('labels.yes', l)
            : t('dashboard.disabled', l, { reason: record.disabledReason || '—' })
        )
      ),
      buildRow(
        t('labels.triggers', l),
        escapeHtml(
          (body.triggers || [])
            .map((tr) => `${tr.id}:${tr.type === 'event' ? tr.event : tr.type}`)
            .join(', ') || '—'
        )
      ),
      schedules.length ? buildRow(t('labels.schedules', l), escapeHtml(schedules.join('; '))) : '',
      body.description
        ? `<div style="font-size:0.88em;margin:3px 0">${escapeHtml(truncate(body.description, 300))}</div>`
        : '',
      buildSectionLabel(t('labels.steps', l)),
      steps.join('') || `<div>${escapeHtml(t('labels.noSteps', l))}</div>`,
      buildDivider(),
      buildButton(t('buttons.validate', l), cmd('definition', 'validate', '--id', id)),
      draftAhead || !record.current
        ? buildButton(
            t('buttons.publish', l),
            cmd('definition', 'publish', '--id', id, '--rev', rev)
          )
        : '',
      record.current
        ? buildButton(
            record.enabled ? t('buttons.disable', l) : t('buttons.enable', l),
            cmd('definition', record.enabled ? 'disable' : 'enable', '--id', id, '--rev', rev)
          )
        : '',
      record.enabled
        ? buildButton(t('buttons.start', l), cmd('instance', 'start', '--definition', id))
        : '',
      record.current
        ? buildSecondaryButton(
            t('buttons.dryRun', l),
            cmd('instance', 'dry-run', '--definition', id)
          )
        : '',
      buildSecondaryButton(t('buttons.export', l), cmd('definition', 'export', '--id', id)),
      buildSecondaryButton(t('buttons.clone', l), cmd('definition', 'clone', '--id', id)),
      buildSecondaryButton(t('buttons.archive', l), cmd('definition', 'archive', '--id', id)),
      buildSecondaryButton(
        t('buttons.purge', l),
        cmd('definition', 'purge', '--id', id, '--preview')
      ),
    ];
    whisper(playerId, truncate(record.name, 60), lines);
  }

  /**
   * `definition purge --preview` / `--confirm <token>`.
   *
   * @param {string} playerId GM.
   * @param {object} opts Options.
   * @returns {void}
   */
  function purgeCommand(playerId, opts) {
    const l = lang();
    if (opts.confirm) {
      const confirmation = consumeConfirmation(opts.confirm, playerId);
      if (!confirmation.ok || confirmation.op !== 'purge') {
        fail(playerId, confirmation.reason || 'confirmationUnknown');
        return;
      }
      const id = confirmation.payload.id;
      const record = getRecord(id);
      if (!record || record.rev !== confirmation.payload.rev) {
        fail(playerId, 'stale', { id, rev: record?.rev ?? '—' });
        return;
      }
      report(playerId, purgeRecord(id, playerId), t('messages.purged', l, { id }));
      return;
    }
    const record = opts.id ? getRecord(opts.id) : null;
    if (!record) {
      fail(playerId, 'definitionNotFound', { id: opts.id || '' });
      return;
    }
    const deps = dependencies(opts.id);
    if (deps.runs || deps.queued || deps.callers.length) {
      fail(playerId, 'purgeBlocked', {
        runs: deps.runs,
        queued: deps.queued,
        callers: deps.callers.join(', ') || '—',
      });
      return;
    }
    const token = issueConfirmation(playerId, 'purge', { id: opts.id, rev: record.rev });
    whisper(playerId, t('titles.confirm', l), [
      `<div>${escapeHtml(t('messages.purgePreview', l, { id: opts.id, schedules: deps.schedules }))}</div>`,
      buildButton(t('buttons.confirmPurge', l), cmd('definition', 'purge', '--confirm', token)),
    ]);
  }

  /**
   * `definition export`: escaped JSON in bounded chat pages, or a private handout.
   *
   * @param {string} playerId GM.
   * @param {object} opts Options.
   * @returns {void}
   */
  function exportCommand(playerId, opts) {
    const l = lang();
    const body = exportDefinition(opts.id, { draft: Boolean(opts.draft) });
    const text = JSON.stringify(body);
    if (opts.handout) {
      const name = `${HANDOUT_EXPORT_NAME}: ${opts.id}`;
      const handout =
        findObjects({ _type: 'handout', name })[0] ||
        createObject('handout', { name, inplayerjournals: '', controlledby: '' });
      handout?.set('gmnotes', `<pre>${escapeHtml(text)}</pre>`);
      ok(playerId, t('messages.exportedHandout', l, { name }));
      return;
    }
    const size = 1500;
    const pages = Math.ceil(text.length / size);
    for (let i = 0; i < Math.min(pages, 20); i += 1) {
      whisper(
        playerId,
        t('titles.export', l, { page: i + 1, pages }),
        `<pre style="white-space:pre-wrap;font-size:0.8em">${escapeHtml(text.slice(i * size, (i + 1) * size))}</pre>`
      );
    }
    ok(playerId, t('messages.exportHint', l, { command: `${COMMAND} definition import --json` }));
  }

  /**
   * `definition import` (single message or begin/part/commit).
   *
   * @param {string} playerId GM.
   * @param {string} sub Sub-verb.
   * @param {object} opts Options.
   * @param {string|null} json JSON.
   * @returns {void}
   */
  function importCommand(playerId, sub, opts, json) {
    const l = lang();
    const s = getState();
    const limits = getLimits();
    const finish = (text) => {
      const parsed = parseJsonSafe(text, limits.importBytes);
      if (!parsed.ok) {
        fail(playerId, parsed.error, { path: parsed.path || '', max: limits.importBytes });
        return;
      }
      const result = importDefinition(parsed.value, playerId, { replace: Boolean(opts.replace) });
      if (!result.ok && result.errors) {
        whisper(
          playerId,
          t('titles.validation', l),
          `<div>${escapeHtml(t('messages.invalid', l, { id: String(parsed.value?.id ?? '?'), count: result.errors.length }))}</div>${formatErrors(result.errors)}`
        );
        return;
      }
      report(
        playerId,
        result,
        t('messages.imported', l, { id: parsed.value.id, revision: result.revision }),
        [buildButton(t('buttons.show', l), cmd('definition', 'show', '--id', parsed.value.id))]
      );
    };
    switch (sub) {
      case '':
        if (!json) {
          fail(playerId, 'emptyJson');
          return;
        }
        finish(json);
        return;
      case 'begin': {
        const parts = parseStrictInt(opts.parts);
        if (!parts || parts < 1 || parts > 64) {
          fail(playerId, 'badParts');
          return;
        }
        s.imports[playerId] = { parts, received: [], expiresAt: now() + 10 * 60 * 1000 };
        ok(playerId, t('messages.importBegun', l, { parts }));
        return;
      }
      case 'part': {
        const pending = s.imports[playerId];
        const n = parseStrictInt(opts.n);
        if (!pending || pending.expiresAt < now()) {
          delete s.imports[playerId];
          fail(playerId, 'noImport');
          return;
        }
        if (n !== pending.received.length + 1 || n > pending.parts || !json) {
          fail(playerId, 'importOrder', { expected: pending.received.length + 1 });
          return;
        }
        const total = pending.received.reduce((sum, p) => sum + p.length, 0) + json.length;
        if (total > limits.importBytes) {
          delete s.imports[playerId];
          fail(playerId, 'tooLarge', { max: limits.importBytes });
          return;
        }
        pending.received.push(json);
        ok(playerId, t('messages.importPart', l, { n, parts: pending.parts }));
        return;
      }
      case 'commit': {
        const pending = s.imports[playerId];
        if (!pending || pending.expiresAt < now() || pending.received.length !== pending.parts) {
          fail(playerId, 'noImport');
          return;
        }
        delete s.imports[playerId];
        finish(pending.received.join(''));
        return;
      }
      case 'cancel':
        delete s.imports[playerId];
        ok(playerId, t('messages.importCancelled', l));
        return;
      default:
        fail(playerId, 'unknownCommand', { command: `definition import ${sub}` });
    }
  }

  /**
   * `definition set --field name|description --value …`.
   *
   * @param {string} playerId GM.
   * @param {object} opts Options.
   * @param {number|undefined} rev Revision guard.
   * @returns {void}
   */
  function setField(playerId, opts, rev) {
    const l = lang();
    const field = opts.field;
    if (!['name', 'description'].includes(field) || typeof opts.value !== 'string') {
      fail(playerId, 'badField', { fields: 'name, description' });
      return;
    }
    const result = updateDraft(
      opts.id,
      (draft) => {
        draft[field] = opts.value.slice(
          0,
          field === 'name' ? getLimits().nameLength : getLimits().stringLength
        );
      },
      playerId,
      rev
    );
    report(playerId, result, t('messages.draftUpdated', l, { id: opts.id }), draftButtons(opts.id));
  }

  /**
   * Buttons after a draft edit.
   *
   * @param {string} id Definition ID.
   * @returns {string[]} Buttons.
   */
  function draftButtons(id) {
    const l = lang();
    const record = getRecord(id);
    return [
      buildButton(t('buttons.validate', l), cmd('definition', 'validate', '--id', id)),
      buildButton(
        t('buttons.publish', l),
        cmd('definition', 'publish', '--id', id, '--rev', String(record?.rev ?? 1))
      ),
      buildSecondaryButton(t('buttons.show', l), cmd('definition', 'show', '--id', id)),
    ];
  }

  /**
   * Parses the JSON payload of an edit command.
   *
   * @param {string} playerId GM.
   * @param {string|null} json JSON.
   * @returns {*} Value, or undefined after reporting the error.
   */
  function editJson(playerId, json) {
    const parsed = parseJsonSafe(json || '', getLimits().payloadBytes);
    if (!parsed.ok) {
      fail(playerId, parsed.error, { path: parsed.path || '', max: getLimits().payloadBytes });
      return undefined;
    }
    return parsed.value;
  }

  /**
   * `definition param|binding --id --name n --json {…}` or `--remove`.
   *
   * @param {string} playerId GM.
   * @param {string} key parameters or bindings.
   * @param {object} opts Options.
   * @param {string|null} json JSON.
   * @param {number|undefined} rev Revision guard.
   * @returns {void}
   */
  function editMapEntry(playerId, key, opts, json, rev) {
    if (!opts.name || !ID_PATTERN.test(opts.name)) {
      fail(playerId, 'badId', { id: opts.name || '' });
      return;
    }
    const value = opts.remove ? null : editJson(playerId, json);
    if (value === undefined) {
      return;
    }
    const result = updateDraft(
      opts.id,
      (draft) => {
        draft[key] = isRecord(draft[key]) ? draft[key] : {};
        if (opts.remove) {
          delete draft[key][opts.name];
        } else {
          draft[key][opts.name] = value;
        }
      },
      playerId,
      rev
    );
    report(
      playerId,
      result,
      t('messages.draftUpdated', lang(), { id: opts.id }),
      draftButtons(opts.id)
    );
  }

  /**
   * `definition access|policy --id --json {…}` (replaces the object).
   *
   * @param {string} playerId GM.
   * @param {string} key access or policy.
   * @param {string|null} json JSON.
   * @param {number|undefined} rev Revision guard.
   * @param {string} id Definition ID.
   * @returns {void}
   */
  function editObject(playerId, key, json, rev, id) {
    const value = editJson(playerId, json);
    if (value === undefined) {
      return;
    }
    if (!isRecord(value)) {
      fail(playerId, 'notObject');
      return;
    }
    const result = updateDraft(
      id,
      (draft) => {
        draft[key] = value;
      },
      playerId,
      rev
    );
    report(playerId, result, t('messages.draftUpdated', lang(), { id }), draftButtons(id));
  }

  /**
   * `definition trigger add|remove`.
   *
   * @param {string} playerId GM.
   * @param {string} sub add or remove.
   * @param {object} opts Options.
   * @param {string|null} json JSON.
   * @param {number|undefined} rev Revision guard.
   * @returns {void}
   */
  function editTrigger(playerId, sub, opts, json, rev) {
    let result;
    if (sub === 'add') {
      const value = editJson(playerId, json);
      if (value === undefined) {
        return;
      }
      result = updateDraft(
        opts.id,
        (draft) => {
          draft.triggers = Array.isArray(draft.triggers) ? draft.triggers : [];
          if (draft.triggers.some((tr) => tr.id === value?.id)) {
            return { ok: false, error: 'duplicateTrigger', vars: { id: String(value?.id) } };
          }
          draft.triggers.push(value);
        },
        playerId,
        rev
      );
    } else if (sub === 'remove') {
      result = updateDraft(
        opts.id,
        (draft) => {
          const before = (draft.triggers || []).length;
          draft.triggers = (draft.triggers || []).filter((tr) => tr.id !== opts.trigger);
          if (draft.triggers.length === before) {
            return { ok: false, error: 'triggerNotFound', vars: { id: opts.trigger || '' } };
          }
        },
        playerId,
        rev
      );
    } else {
      fail(playerId, 'unknownCommand', { command: `definition trigger ${sub}` });
      return;
    }
    report(
      playerId,
      result,
      t('messages.draftUpdated', lang(), { id: opts.id }),
      draftButtons(opts.id)
    );
  }

  /**
   * `definition step add|edit|remove|move` on the draft.
   *
   * @param {string} playerId GM.
   * @param {string} sub Sub-verb.
   * @param {object} opts Options.
   * @param {string|null} json JSON.
   * @param {number|undefined} rev Revision guard.
   * @returns {void}
   */
  function editStep(playerId, sub, opts, json, rev) {
    let value;
    if (sub === 'add' || sub === 'edit') {
      value = editJson(playerId, json);
      if (value === undefined) {
        return;
      }
      if (!isRecord(value)) {
        fail(playerId, 'notObject');
        return;
      }
    }
    const result = updateDraft(
      opts.id,
      (draft) => {
        draft.steps = Array.isArray(draft.steps) ? draft.steps : [];
        switch (sub) {
          case 'add': {
            if (!STEP_SPECS[value.type]) {
              return { ok: false, error: 'unknownAction', vars: { type: String(value.type) } };
            }
            if (findStepLocation(draft.steps, value.id)) {
              return { ok: false, error: 'duplicateStep', vars: { id: String(value.id) } };
            }
            let list = blockList(draft, opts.block || 'root');
            let index = list ? list.length : 0;
            if (opts.after) {
              const location = findStepLocation(draft.steps, opts.after);
              if (!location) {
                return { ok: false, error: 'stepNotFound', vars: { id: opts.after } };
              }
              list = location.list;
              index = location.index + 1;
            } else if (opts.index !== undefined) {
              index = parseStrictInt(opts.index);
            }
            if (!list || index === null || index < 0 || index > list.length) {
              return { ok: false, error: 'badBlock', vars: { block: opts.block || 'root' } };
            }
            list.splice(index, 0, value);
            return { ok: true };
          }
          case 'edit': {
            const location = findStepLocation(draft.steps, opts.step);
            if (!location) {
              return { ok: false, error: 'stepNotFound', vars: { id: opts.step || '' } };
            }
            // A patch: given fields replace, `null` removes, the ID stays.
            const step = location.list[location.index];
            for (const [key, v] of Object.entries(value)) {
              if (key === 'id') {
                continue;
              }
              if (v === null) {
                delete step[key];
              } else {
                step[key] = v;
              }
            }
            return { ok: true };
          }
          case 'remove': {
            const location = findStepLocation(draft.steps, opts.step);
            if (!location) {
              return { ok: false, error: 'stepNotFound', vars: { id: opts.step || '' } };
            }
            location.list.splice(location.index, 1);
            return { ok: true };
          }
          case 'move': {
            const location = findStepLocation(draft.steps, opts.step);
            if (!location) {
              return { ok: false, error: 'stepNotFound', vars: { id: opts.step || '' } };
            }
            const [step] = location.list.splice(location.index, 1);
            const target = opts.block ? blockList(draft, opts.block) : location.list;
            const index = opts.index === undefined ? target?.length : parseStrictInt(opts.index);
            if (!target || index === null || index < 0 || index > target.length) {
              location.list.splice(location.index, 0, step);
              return { ok: false, error: 'badBlock', vars: { block: opts.block || '' } };
            }
            target.splice(index, 0, step);
            return { ok: true };
          }
          default:
            return {
              ok: false,
              error: 'unknownCommand',
              vars: { command: `definition step ${sub}` },
            };
        }
      },
      playerId,
      rev
    );
    report(
      playerId,
      result,
      t('messages.draftUpdated', lang(), { id: opts.id }),
      draftButtons(opts.id)
    );
  }

  // ---------------------------------------------------------------------------
  // Templates
  // ---------------------------------------------------------------------------

  /**
   * `template list|add <id>`.
   *
   * @param {string} playerId GM.
   * @param {object[]} words Words.
   * @returns {void}
   */
  function commandTemplate(playerId, words) {
    const l = lang();
    const verb = (words[0]?.text || 'list').toLowerCase();
    if (verb === 'list') {
      const rows = TEMPLATES.map(
        (tpl) =>
          `<div style="margin:3px 0"><strong>${escapeHtml(tpl.name)}</strong> <span style="font-size:0.85em">${escapeHtml(tpl.id)}</span> ${getRecord(tpl.id) ? escapeHtml(t('labels.installed', l)) : buildButton(t('buttons.add', l), cmd('template', 'add', tpl.id))}<br><span style="font-size:0.85em">${escapeHtml(tpl.description)}</span></div>`
      );
      whisper(playerId, t('titles.templates', l), rows);
      return;
    }
    if (verb !== 'add') {
      fail(playerId, 'unknownCommand', { command: `template ${verb}` });
      return;
    }
    const id = words[1]?.text;
    const tpl = id ? getTemplate(id) : null;
    if (!tpl) {
      fail(playerId, 'templateNotFound', { id: id || '' });
      return;
    }
    const added = [];
    for (const depId of [...(TEMPLATE_DEPENDENCIES[id] || []), id]) {
      if (getRecord(depId)) {
        continue;
      }
      const result = importDefinition(clone(getTemplate(depId)), playerId);
      if (!result.ok) {
        fail(playerId, result.error || 'invalidDefinition', result.vars || {});
        return;
      }
      added.push(depId);
    }
    audit('template.add', { template: id, by: playerId });
    const enabled = getRecord(id)?.enabled;
    ok(
      playerId,
      t(enabled ? 'messages.templateAdded' : 'messages.templateAddedDisabled', l, {
        ids: added.join(', ') || id,
      }),
      [buildButton(t('buttons.show', l), cmd('definition', 'show', '--id', id))]
    );
  }

  // ---------------------------------------------------------------------------
  // Instances
  // ---------------------------------------------------------------------------

  /**
   * `instance …` commands. Players may start published tasks and manage
   * their own runs.
   *
   * @param {object} msg Message.
   * @param {string} playerId Real sender.
   * @param {object[]} words Words.
   * @param {boolean} gm Caller is a GM.
   * @returns {void}
   */
  function commandInstance(msg, playerId, words, gm) {
    const verb = (words[0]?.text || 'list').toLowerCase();
    const parsed = parseOptions(words.slice(1), {
      definition: 'value',
      id: 'value',
      rev: 'value',
      bind: 'multi',
      param: 'multi',
      status: 'value',
      page: 'value',
      action: 'value',
      confirm: 'value',
      'dry-run': 'flag',
    });
    if (parsed.error) {
      fail(playerId, parsed.error, parsed.vars);
      return;
    }
    const { opts } = parsed;
    const rev = revOf(opts);
    if (rev === null) {
      fail(playerId, 'badRev');
      return;
    }
    const l = lang();
    const runFor = () => {
      const inst = opts.id ? getInstance(opts.id) : null;
      if (!inst || !canManageRun(playerId, inst)) {
        fail(playerId, 'runNotFound', { id: opts.id || '' });
        return null;
      }
      if (rev !== undefined && inst.revision !== rev) {
        fail(playerId, 'stale', { id: inst.id, rev: inst.revision });
        return null;
      }
      return inst;
    };
    switch (verb) {
      case 'start':
      case 'dry-run':
        startCommand(msg, playerId, opts, verb === 'dry-run' || Boolean(opts['dry-run']));
        return;
      case 'list':
        listRuns(playerId, opts, gm);
        return;
      case 'inspect': {
        const inst = runFor();
        if (inst) {
          inspectRun(playerId, inst, gm);
        }
        return;
      }
      case 'pause': {
        const inst = runFor();
        if (inst) {
          report(playerId, pauseRun(inst.id, playerId), t('messages.paused', l, { id: inst.id }), [
            buildButton(
              t('buttons.resume', l),
              cmd('instance', 'resume', '--id', inst.id, '--rev', String(inst.revision))
            ),
          ]);
        }
        return;
      }
      case 'resume': {
        const inst = runFor();
        if (inst) {
          report(playerId, resumeRun(inst.id, playerId), t('messages.resumed', l, { id: inst.id }));
        }
        return;
      }
      case 'cancel': {
        const inst = runFor();
        if (inst) {
          report(
            playerId,
            cancelRun(inst.id, playerId),
            t('messages.cancelled', l, { id: inst.id, effects: inst.effects })
          );
        }
        return;
      }
      case 'rerun': {
        const source = opts.id
          ? getInstance(opts.id) || getState().history.find((h) => h.id === opts.id)
          : null;
        if (
          !source ||
          (!gm && source.initiatorPlayerId !== playerId && source.initiator !== playerId)
        ) {
          fail(playerId, 'runNotFound', { id: opts.id || '' });
          return;
        }
        const def = getSnapshot(source.definitionId);
        if (!def || !canStart(playerId, def, source.bindings).ok) {
          fail(playerId, 'notAllowed');
          return;
        }
        const result = rerun(opts.id, playerId);
        startReply(playerId, result, source.definitionId);
        return;
      }
      case 'decide':
        if (!gm) {
          fail(playerId, 'gmOnly');
          return;
        }
        decideCommand(playerId, opts, rev);
        return;
      default:
        fail(playerId, 'unknownCommand', { command: `instance ${verb}` });
    }
  }

  /**
   * Starts (or dry-runs) a definition from a command. Selection is captured
   * now and stored as IDs.
   *
   * @param {object} msg Message.
   * @param {string} playerId Real sender.
   * @param {object} opts Options.
   * @param {boolean} dryRun Validate only.
   * @returns {void}
   */
  function startCommand(msg, playerId, opts, dryRun) {
    const l = lang();
    const record = opts.definition ? getRecord(opts.definition) : null;
    const def = record ? getSnapshot(record.id) : null;
    if (!def || (!isGm(playerId) && def.access?.mode !== 'players')) {
      fail(playerId, 'definitionNotFound', { id: opts.definition || '' });
      return;
    }
    const rawParams = pairs(opts.param);
    const rawBind = pairs(opts.bind);
    if (!rawParams || !rawBind) {
      fail(playerId, 'badPair');
      return;
    }
    const params = resolveParams(def, rawParams);
    if (!params.ok) {
      fail(playerId, params.error, params.vars);
      return;
    }
    const explicit = {};
    for (const [name, value] of Object.entries(rawBind)) {
      if (!def.bindings?.[name]) {
        fail(playerId, 'unknownBinding', { name });
        return;
      }
      // Only a GM may aim a task at objects by ID; players use their selection.
      if (value !== 'selected' && !isGm(playerId)) {
        fail(playerId, 'notController');
        return;
      }
      explicit[name] = value === 'selected' ? 'selected' : value.split(',').filter(Boolean);
    }
    const bindings = resolveBindings(def, {
      selected: selectedIds(msg),
      explicit,
      params: params.params,
    });
    if (!bindings.ok) {
      const first = bindings.errors[0];
      fail(playerId, `binding_${first.code}`, {
        binding: first.binding,
        id: first.id || '',
        max: first.max || '',
      });
      return;
    }
    const allowed = canStart(playerId, def, bindings.bindings);
    if (!allowed.ok) {
      fail(playerId, allowed.reason);
      return;
    }
    if (dryRun) {
      const check = validateBody(def);
      const targets = Object.entries(bindings.bindings).map(
        ([name, ids]) => `${name}: ${ids.map(targetLabel).join(', ') || '—'}`
      );
      whisper(playerId, t('titles.dryRun', l), [
        `<div>${escapeHtml(t(check.ok ? 'messages.dryRunOk' : 'messages.invalid', l, { id: def.id, count: check.errors.length }))}</div>`,
        targets.length
          ? `<div style="font-size:0.9em">${escapeHtml(targets.join('; '))}</div>`
          : '',
        check.ok ? '' : formatErrors(check.errors),
        check.warnings.length ? formatErrors(check.warnings) : '',
        `<div style="font-size:0.85em;opacity:0.8">${escapeHtml(t('messages.dryRunNote', l))}</div>`,
      ]);
      return;
    }
    const result = admitRun(record.id, {
      initiatorId: def.access?.authority === 'gmService' && isGm(playerId) ? null : playerId,
      params: params.params,
      bindings: bindings.bindings,
      trigger: { type: 'manual', id: 'manual' },
    });
    startReply(playerId, result, record.id);
  }

  /**
   * Replies to a start.
   *
   * @param {string} playerId Player.
   * @param {object} result Admission result.
   * @param {string} defId Definition ID.
   * @returns {void}
   */
  function startReply(playerId, result, defId) {
    const l = lang();
    if (result.status === 'started') {
      const inst = result.instance;
      ok(playerId, t('messages.started', l, { id: inst.id, definition: defId }), [
        buildSecondaryButton(
          t('buttons.pause', l),
          cmd('instance', 'pause', '--id', inst.id, '--rev', String(inst.revision))
        ),
        buildSecondaryButton(
          t('buttons.cancel', l),
          cmd('instance', 'cancel', '--id', inst.id, '--rev', String(inst.revision))
        ),
        buildSecondaryButton(t('buttons.inspect', l), cmd('instance', 'inspect', '--id', inst.id)),
      ]);
      return;
    }
    if (result.status === 'queued') {
      ok(playerId, t('messages.queued', l, { definition: defId }));
      return;
    }
    if (result.status === 'skipped') {
      fail(playerId, 'alreadyRunning', { id: defId });
      return;
    }
    fail(playerId, result.reason || 'rejected', result.vars || {});
  }

  /**
   * Lists runs (players see their own).
   *
   * @param {string} playerId Player.
   * @param {object} opts Options.
   * @param {boolean} gm Caller is a GM.
   * @returns {void}
   */
  function listRuns(playerId, opts, gm) {
    const l = lang();
    const runs = listInstances(
      (i) =>
        (gm || i.initiatorPlayerId === playerId) &&
        (!opts.status
          ? ACTIVE_STATUSES.has(i.status)
          : opts.status === 'all' || i.status === opts.status) &&
        (!opts.definition || i.definitionId === opts.definition)
    );
    if (!runs.length) {
      whisper(playerId, t('titles.runs', l), escapeHtml(t('dashboard.noRuns', l)));
      return;
    }
    const page = Math.max(1, parseStrictInt(opts.page) || 1);
    const rows = runs.slice((page - 1) * 15, page * 15).map((i) => {
      const controls = [];
      if (i.status === STATUS.RUNNING || i.status === STATUS.WAITING) {
        controls.push(
          buildSecondaryButton(
            t('buttons.pause', l),
            cmd('instance', 'pause', '--id', i.id, '--rev', String(i.revision))
          )
        );
      }
      if (i.status === STATUS.PAUSED) {
        controls.push(
          buildButton(
            t('buttons.resume', l),
            cmd('instance', 'resume', '--id', i.id, '--rev', String(i.revision))
          )
        );
      }
      controls.push(buildSecondaryButton('⋯', cmd('instance', 'inspect', '--id', i.id)));
      return `<div style="margin:2px 0"><strong>${escapeHtml(i.id)}</strong> ${escapeHtml(i.definitionId)} · ${escapeHtml(t(`statuses.${i.status}`, l))} ${controls.join('')}</div>`;
    });
    if (runs.length > page * 15) {
      rows.push(
        buildSecondaryButton(
          t('dashboard.next', l),
          cmd('instance', 'list', '--page', String(page + 1))
        )
      );
    }
    whisper(playerId, t('titles.runs', l), rows);
  }

  /**
   * Shows one run in detail. Players see a reduced card for their own runs.
   *
   * @param {string} playerId Player.
   * @param {object} inst Instance.
   * @param {boolean} gm Caller is a GM.
   * @returns {void}
   */
  function inspectRun(playerId, inst, gm) {
    const l = lang();
    const rev = String(inst.revision);
    const lines = [
      buildRow(
        t('labels.definition', l),
        escapeHtml(`${inst.definitionId} r${inst.definitionRevision}`)
      ),
      buildRow(
        t('labels.status', l),
        escapeHtml(
          t(`statuses.${inst.status}`, l) +
            (inst.review ? ` (${t(`review.${inst.review.reason}`, l)})` : '')
        )
      ),
      buildRow(t('labels.step', l), escapeHtml(currentStep(inst) || '—')),
      buildRow(t('labels.started', l), escapeHtml(formatUtc(inst.startedAt))),
    ];
    if (gm) {
      lines.push(
        buildRow(
          t('labels.initiator', l),
          escapeHtml(
            inst.initiatorPlayerId ? playerName(inst.initiatorPlayerId) : t('labels.gmService', l)
          )
        )
      );
      lines.push(
        buildRow(
          t('labels.targets', l),
          escapeHtml(
            Object.entries(inst.bindings)
              .map(([k, ids]) => `${k}: ${ids.map(targetLabel).join(', ')}`)
              .join('; ') || '—'
          )
        )
      );
      if (inst.intendedDueAt) {
        lines.push(buildRow(t('labels.lateness', l), escapeHtml(formatDuration(inst.latenessMs))));
      }
      if (inst.error) {
        lines.push(
          `<div style="font-size:0.9em">${escapeHtml(t(`runErrors.${inst.error.reason}`, l, inst.error.vars || {}))}${inst.error.stepId ? ` @ ${escapeHtml(inst.error.stepId)}` : ''}</div>`
        );
      }
      const journal = Object.entries(inst.journal).slice(-8);
      if (journal.length) {
        lines.push(buildSectionLabel(t('labels.journal', l)));
        for (const [key, entry] of journal) {
          lines.push(
            `<div style="font-size:0.85em">${escapeHtml(key)}: ${escapeHtml(t(`journal.${entry.status}`, l))}</div>`
          );
        }
      }
      lines.push(buildSectionLabel(t('labels.timeline', l)));
      for (const entry of inst.timeline.slice(-10)) {
        lines.push(
          `<div style="font-size:0.82em">${escapeHtml(formatUtc(entry.at).slice(11))} ${escapeHtml(t(`timeline.${entry.kind}`, l, entry))}</div>`
        );
      }
    }
    lines.push(buildDivider());
    if (inst.status === STATUS.RUNNING || inst.status === STATUS.WAITING) {
      lines.push(
        buildButton(t('buttons.pause', l), cmd('instance', 'pause', '--id', inst.id, '--rev', rev))
      );
    }
    if (inst.status === STATUS.PAUSED) {
      lines.push(
        buildButton(
          t('buttons.resume', l),
          cmd('instance', 'resume', '--id', inst.id, '--rev', rev)
        )
      );
    }
    if (inst.status === STATUS.REVIEW && gm) {
      for (const decision of decisionsFor(inst)) {
        lines.push(
          buildButton(
            t(`decisions.${decision}`, l),
            cmd('instance', 'decide', '--id', inst.id, '--action', decision, '--rev', rev)
          )
        );
      }
    }
    if (ACTIVE_STATUSES.has(inst.status) && inst.status !== STATUS.REVIEW) {
      lines.push(
        buildSecondaryButton(
          t('buttons.cancel', l),
          cmd('instance', 'cancel', '--id', inst.id, '--rev', rev)
        )
      );
    }
    if (!ACTIVE_STATUSES.has(inst.status)) {
      lines.push(
        buildSecondaryButton(t('buttons.rerun', l), cmd('instance', 'rerun', '--id', inst.id))
      );
    }
    whisper(playerId, inst.id, lines);
  }

  /**
   * `instance decide` for runs in review. Retrying an action whose outcome is
   * uncertain could duplicate it, so that needs a confirmation.
   *
   * @param {string} playerId GM.
   * @param {object} opts Options.
   * @param {number|undefined} rev Revision guard.
   * @returns {void}
   */
  function decideCommand(playerId, opts, rev) {
    const l = lang();
    if (opts.confirm) {
      const confirmation = consumeConfirmation(opts.confirm, playerId);
      if (!confirmation.ok || confirmation.op !== 'decide') {
        fail(playerId, confirmation.reason || 'confirmationUnknown');
        return;
      }
      const inst = getInstance(confirmation.payload.id);
      if (!inst || inst.revision !== confirmation.payload.rev) {
        fail(playerId, 'stale', { id: confirmation.payload.id, rev: inst?.revision ?? '—' });
        return;
      }
      report(
        playerId,
        decideReview(inst.id, confirmation.payload.action, playerId),
        t('messages.decided', l, {
          id: inst.id,
          action: t(`decisions.${confirmation.payload.action}`, l),
        })
      );
      return;
    }
    const inst = opts.id ? getInstance(opts.id) : null;
    if (!inst) {
      fail(playerId, 'runNotFound', { id: opts.id || '' });
      return;
    }
    if (rev !== undefined && inst.revision !== rev) {
      fail(playerId, 'stale', { id: inst.id, rev: inst.revision });
      return;
    }
    const action = opts.action;
    if (
      !['retry', 'skip', 'complete', 'skipNext', 'cancel'].includes(action) ||
      !decisionsFor(inst).includes(action)
    ) {
      fail(playerId, 'badDecision', { actions: decisionsFor(inst).join(', ') });
      return;
    }
    const risky =
      action === 'retry' && ['uncertainOutcome', 'restartConflict'].includes(inst.review?.reason);
    if (risky) {
      const token = issueConfirmation(playerId, 'decide', {
        id: inst.id,
        rev: inst.revision,
        action,
      });
      whisper(playerId, t('titles.confirm', l), [
        `<div>${escapeHtml(t('messages.retryWarning', l, { id: inst.id, step: inst.review.stepId || '' }))}</div>`,
        buildButton(t('buttons.confirmRetry', l), cmd('instance', 'decide', '--confirm', token)),
      ]);
      return;
    }
    report(
      playerId,
      decideReview(inst.id, action, playerId),
      t('messages.decided', l, { id: inst.id, action: t(`decisions.${action}`, l) })
    );
  }

  // ---------------------------------------------------------------------------
  // Schedules
  // ---------------------------------------------------------------------------

  /**
   * `schedule add|list|pause|resume|remove|offset|preview`.
   *
   * @param {string} playerId GM.
   * @param {object[]} words Words.
   * @returns {void}
   */
  function commandSchedule(playerId, words) {
    const verb = (words[0]?.text || 'list').toLowerCase();
    const parsed = parseOptions(words.slice(1), {
      definition: 'value',
      id: 'value',
      rev: 'value',
      at: 'value',
      every: 'value',
      anchor: 'value',
      mode: 'value',
      daily: 'value',
      weekly: 'value',
      time: 'value',
      offset: 'value',
      start: 'value',
      end: 'value',
      count: 'value',
      overdue: 'value',
      bind: 'multi',
      param: 'multi',
      yes: 'flag',
    });
    if (parsed.error) {
      fail(playerId, parsed.error, parsed.vars);
      return;
    }
    const { opts } = parsed;
    const l = lang();
    const rev = revOf(opts);
    if (rev === null) {
      fail(playerId, 'badRev');
      return;
    }
    switch (verb) {
      case 'add':
        return addScheduleCommand(playerId, opts);
      case 'list': {
        const list = listSchedules(opts.definition);
        const rows = list.slice(0, 30).map((sc) => {
          const state = sc.paused
            ? t('statuses.paused', l)
            : sc.ended
              ? t('labels.ended', l)
              : formatUtc(sc.cursor.nextDueAt);
          const control = sc.paused
            ? buildButton(
                t('buttons.resume', l),
                cmd('schedule', 'resume', '--id', sc.id, '--rev', String(sc.rev))
              )
            : sc.ended
              ? ''
              : buildSecondaryButton(
                  t('buttons.pause', l),
                  cmd('schedule', 'pause', '--id', sc.id, '--rev', String(sc.rev))
                );
          return `<div style="margin:2px 0"><strong>${escapeHtml(sc.id)}</strong> ${escapeHtml(sc.definitionId)} · ${escapeHtml(describeSpec(sc.spec))} · ${escapeHtml(state)} ${control}${buildSecondaryButton('×', cmd('schedule', 'remove', '--id', sc.id))}</div>`;
        });
        whisper(
          playerId,
          t('titles.schedules', l),
          rows.length ? rows : escapeHtml(t('messages.noSchedules', l))
        );
        return;
      }
      case 'pause':
        report(
          playerId,
          pauseSchedule(opts.id, playerId, rev),
          t('messages.schedulePaused', l, { id: opts.id || '' }),
          [
            buildButton(
              t('buttons.resumeSkip', l),
              cmd('schedule', 'resume', '--id', opts.id || '', '--mode', 'skipPausedRange')
            ),
            buildSecondaryButton(
              t('buttons.resumeCatchUp', l),
              cmd('schedule', 'resume', '--id', opts.id || '', '--mode', 'catchUp')
            ),
          ]
        );
        return;
      case 'resume': {
        const mode = opts.mode || 'skipPausedRange';
        if (!['skipPausedRange', 'catchUp'].includes(mode)) {
          fail(playerId, 'badMode', { modes: 'skipPausedRange, catchUp' });
          return;
        }
        const result = resumeSchedule(opts.id, playerId, mode, rev);
        report(
          playerId,
          result,
          t('messages.scheduleResumed', l, {
            id: opts.id || '',
            skipped: result.skipped ?? result.summary?.missed ?? 0,
          })
        );
        return;
      }
      case 'remove':
        report(
          playerId,
          {
            ok: removeSchedule(opts.id, playerId),
            error: 'scheduleNotFound',
            vars: { id: opts.id || '' },
          },
          t('messages.scheduleRemoved', l, { id: opts.id || '' })
        );
        return;
      case 'preview': {
        const sched = getState().schedules[opts.id];
        if (!sched) {
          fail(playerId, 'scheduleNotFound', { id: opts.id || '' });
          return;
        }
        const times = listFrom(sched.spec, now(), 5).map(formatUtc);
        ok(playerId, t('messages.nextTimes', l, { id: sched.id, times: times.join(', ') || '—' }));
        return;
      }
      case 'offset': {
        const offset = parseUtcOffset(opts.offset);
        if (offset === null) {
          fail(playerId, 'badOffset');
          return;
        }
        if (!opts.yes) {
          const preview = previewOffset(opts.id, offset);
          if (!preview.ok) {
            fail(playerId, preview.error, preview.vars);
            return;
          }
          whisper(playerId, t('titles.offset', l), [
            `<div>${escapeHtml(t('messages.offsetPreview', l, { id: opts.id, offset: formatUtcOffset(offset) }))}</div>`,
            `<div style="font-size:0.88em">${escapeHtml(t('labels.before', l))}: ${escapeHtml(preview.before.map(formatUtc).join(', '))}</div>`,
            `<div style="font-size:0.88em">${escapeHtml(t('labels.after', l))}: ${escapeHtml(preview.after.map(formatUtc).join(', '))}</div>`,
            buildButton(
              t('buttons.apply', l),
              cmd(
                'schedule',
                'offset',
                '--id',
                opts.id,
                '--offset',
                formatUtcOffset(offset),
                '--yes'
              )
            ),
          ]);
          return;
        }
        report(
          playerId,
          applyOffset(opts.id, offset, playerId),
          t('messages.offsetApplied', l, { id: opts.id, offset: formatUtcOffset(offset) })
        );
        return;
      }
      default:
        fail(playerId, 'unknownCommand', { command: `schedule ${verb}` });
    }
  }

  /**
   * Describes a recurrence spec.
   *
   * @param {object} spec Spec.
   * @returns {string} Text.
   */
  function describeSpec(spec) {
    switch (spec.kind) {
      case 'once':
        return `at ${formatUtc(spec.at)}`;
      case 'interval':
        return `every ${formatDuration(spec.everyMs)} (${spec.mode})`;
      case 'daily':
        return `daily ${String(Math.floor(spec.timeMs / 3600000)).padStart(2, '0')}:${String(Math.floor((spec.timeMs % 3600000) / 60000)).padStart(2, '0')} ${formatUtcOffset(spec.offsetMinutes)}`;
      case 'weekly':
        return `weekly ${spec.days.map((d) => ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d]).join(',')} ${String(Math.floor(spec.timeMs / 3600000)).padStart(2, '0')}:${String(Math.floor((spec.timeMs % 3600000) / 60000)).padStart(2, '0')} ${formatUtcOffset(spec.offsetMinutes)}`;
      default:
        return spec.kind;
    }
  }

  /**
   * `schedule add`: parses the times, shows them in UTC and asks for `--yes`
   * before anything is scheduled.
   *
   * @param {string} playerId GM.
   * @param {object} opts Options.
   * @returns {void}
   */
  function addScheduleCommand(playerId, opts) {
    const l = lang();
    const record = opts.definition ? getRecord(opts.definition) : null;
    const def = record ? getSnapshot(record.id) : null;
    if (!def) {
      fail(playerId, 'definitionNotFound', { id: opts.definition || '' });
      return;
    }
    if (def.access?.authority !== 'gmService') {
      fail(playerId, 'scheduleNeedsService', { id: record.id });
      return;
    }
    const window = {};
    for (const key of ['start', 'end']) {
      if (opts[key] !== undefined) {
        const value = parseIsoInstant(opts[key]);
        if (value === null) {
          fail(playerId, 'badInstant', { value: opts[key] });
          return;
        }
        window[key === 'start' ? 'startAt' : 'endAt'] = value;
      }
    }
    if (opts.count !== undefined) {
      window.maxCount = parseStrictInt(opts.count);
    }
    let raw;
    if (opts.at) {
      raw = { kind: 'once', at: parseIsoInstant(opts.at) };
      if (raw.at === null) {
        fail(playerId, 'badInstant', { value: opts.at });
        return;
      }
    } else if (opts.every) {
      const anchor = opts.anchor ? parseIsoInstant(opts.anchor) : now();
      if (anchor === null) {
        fail(playerId, 'badInstant', { value: opts.anchor });
        return;
      }
      raw = {
        ...window,
        kind: 'interval',
        everyMs: durationValue(opts.every),
        anchor,
        mode: opts.mode || 'fixedRate',
      };
    } else if (opts.daily || opts.weekly) {
      const time = opts.daily || opts.time;
      raw = {
        ...window,
        kind: opts.weekly ? 'weekly' : 'daily',
        timeMs: parseClockTime(time),
        offsetMinutes: parseUtcOffset(opts.offset),
        days: opts.weekly ? parseWeekdays(opts.weekly) : undefined,
      };
      if (raw.offsetMinutes === null) {
        fail(playerId, 'offsetRequired');
        return;
      }
    } else {
      fail(playerId, 'scheduleKind');
      return;
    }
    const built = normaliseSpec(raw, getLimits());
    if (!built.ok) {
      fail(playerId, `spec_${built.error}`, { min: formatDuration(getLimits().minIntervalMs) });
      return;
    }
    const bindPairs = pairs(opts.bind);
    const paramPairs = pairs(opts.param);
    if (!bindPairs || !paramPairs) {
      fail(playerId, 'badPair');
      return;
    }
    const params = resolveParams(def, paramPairs);
    if (!params.ok) {
      fail(playerId, params.error, params.vars);
      return;
    }
    const bindings = Object.fromEntries(
      Object.entries(bindPairs).map(([k, v]) => [k, v.split(',').filter(Boolean)])
    );
    const check = resolveBindings(def, {
      explicit: bindings,
      params: params.params,
      unattended: true,
    });
    if (!check.ok) {
      const first = check.errors[0];
      fail(playerId, `binding_${first.code}`, {
        binding: first.binding,
        id: first.id || '',
        max: first.max || '',
      });
      return;
    }
    if (
      opts.overdue &&
      !['skip', 'runOnce', 'catchUpBounded', 'review', 'expire'].includes(opts.overdue)
    ) {
      fail(playerId, 'badMode', { modes: 'skip, runOnce, catchUpBounded, review, expire' });
      return;
    }
    const times = listFrom(built.spec, now(), 3);
    if (!opts.yes) {
      const again = ['schedule', 'add', '--definition', record.id];
      for (const key of [
        'at',
        'every',
        'anchor',
        'mode',
        'daily',
        'weekly',
        'time',
        'offset',
        'start',
        'end',
        'count',
        'overdue',
      ]) {
        if (opts[key] !== undefined) {
          again.push(`--${key}`, opts[key]);
        }
      }
      for (const b of opts.bind || []) {
        again.push('--bind', b);
      }
      for (const p of opts.param || []) {
        again.push('--param', p);
      }
      whisper(playerId, t('titles.schedulePreview', l), [
        buildRow(t('labels.definition', l), escapeHtml(record.id)),
        buildRow(t('labels.schedule', l), escapeHtml(describeSpec(built.spec))),
        buildRow(
          t('labels.nextTimes', l),
          escapeHtml(times.map(formatUtc).join(', ') || t('messages.noFutureTimes', l))
        ),
        built.spec.kind === 'daily' || built.spec.kind === 'weekly'
          ? `<div style="font-size:0.85em">${escapeHtml(t('messages.offsetNote', l))}</div>`
          : '',
        buildButton(t('buttons.confirmSchedule', l), cmd(...again, '--yes')),
      ]);
      return;
    }
    if (!times.length) {
      fail(playerId, 'noFutureTimes');
      return;
    }
    const sched = addSchedule({
      definitionId: record.id,
      spec: built.spec,
      overdue: opts.overdue ? { mode: opts.overdue } : null,
      bindings: check.bindings,
      params: params.params,
      by: playerId,
    });
    ok(
      playerId,
      t('messages.scheduleAdded', l, { id: sched.id, next: formatUtc(sched.cursor.nextDueAt) }),
      [
        buildSecondaryButton(
          t('buttons.pause', l),
          cmd('schedule', 'pause', '--id', sched.id, '--rev', String(sched.rev))
        ),
      ]
    );
  }

  // ---------------------------------------------------------------------------
  // Signals, reports, recovery, config, adapters, emergency
  // ---------------------------------------------------------------------------

  /**
   * `signal <name> [--value v]`. Players may raise only signals a published
   * task listens for.
   *
   * @param {string} playerId Real sender.
   * @param {object[]} words Words.
   * @param {boolean} gm Caller is a GM.
   * @returns {void}
   */
  function commandSignal(playerId, words, gm) {
    const name = words[0]?.text || '';
    const parsed = parseOptions(words.slice(1), { value: 'value' });
    if (parsed.error) {
      fail(playerId, parsed.error, parsed.vars);
      return;
    }
    if (!ID_PATTERN.test(name)) {
      fail(playerId, 'badId', { id: name });
      return;
    }
    if (!gm && !playerSignals().has(name)) {
      fail(playerId, 'signalNotAllowed', { name });
      return;
    }
    const raw = parsed.opts.value;
    const value =
      raw === undefined ? null : /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : truncate(raw, 200);
    raiseSignal(name, value, playerId, 'command');
    ok(playerId, t('messages.signalled', lang(), { name }));
  }

  /**
   * `report missed|runs|audit|diagnostics`.
   *
   * @param {string} playerId GM.
   * @param {object[]} words Words.
   * @returns {void}
   */
  function commandReport(playerId, words) {
    const verb = (words[0]?.text || 'missed').toLowerCase();
    const parsed = parseOptions(words.slice(1), { status: 'value', page: 'value' });
    if (parsed.error) {
      fail(playerId, parsed.error, parsed.vars);
      return;
    }
    const l = lang();
    const page = Math.max(1, parseStrictInt(parsed.opts.page) || 1);
    const s = getState();
    const pageOf = (list) => list.slice((page - 1) * 15, page * 15);
    switch (verb) {
      case 'missed': {
        const status = parsed.opts.status || 'open';
        const list = Object.values(s.incidents)
          .filter(
            (i) =>
              status === 'all' ||
              (status === 'open' ? i.status !== 'resolved' : i.status === status)
          )
          .sort((a, b) => b.createdAt - a.createdAt);
        const rows = pageOf(list).map(
          (i) =>
            `<div style="margin:2px 0;font-size:0.9em"><strong>${escapeHtml(i.id)}</strong> ${escapeHtml(t(`causes.${i.cause}`, l))} ×${i.count} · ${escapeHtml(t(`incidentStatus.${i.status}`, l))}${i.status === 'open' ? buildSecondaryButton(t('buttons.acknowledge', l), cmd('recovery', 'acknowledge', '--incident', i.id)) : ''}${i.proposal?.mode === 'runOnce' && i.status !== 'resolved' ? buildButton(t('buttons.recoverRun', l), cmd('recovery', 'preview', '--incident', i.id, '--mode', 'runOnce')) : ''}</div>`
        );
        whisper(
          playerId,
          t('titles.incidents', l),
          rows.length ? rows : escapeHtml(t('dashboard.noIncidents', l))
        );
        return;
      }
      case 'runs': {
        const rows = pageOf([...s.history].reverse()).map(
          (h) =>
            `<div style="font-size:0.9em">${escapeHtml(h.id)} ${escapeHtml(h.definitionId)} · ${escapeHtml(t(`statuses.${h.status}`, l))} · ${escapeHtml(formatDuration(h.durationMs))}</div>`
        );
        whisper(
          playerId,
          t('titles.history', l),
          rows.length ? rows : escapeHtml(t('dashboard.noHistory', l))
        );
        return;
      }
      case 'audit': {
        const rows = pageOf([...s.audit].reverse()).map(
          (a) =>
            `<div style="font-size:0.82em">${escapeHtml(formatUtc(a.at))} ${escapeHtml(a.kind)} ${escapeHtml(
              truncate(
                Object.entries(a)
                  .filter(([k]) => !['at', 'kind'].includes(k))
                  .map(([k, v]) => `${k}=${v}`)
                  .join(' '),
                120
              )
            )}</div>`
        );
        whisper(playerId, t('titles.audit', l), rows);
        return;
      }
      case 'diagnostics': {
        const stats = runtime.scheduler?.stats() || {};
        const rows = [
          buildRow('jobs', escapeHtml(`${stats.jobs} (${stats.stale} stale)`)),
          buildRow('next', escapeHtml(stats.nextDueAt ? formatUtc(stats.nextDueAt) : '—')),
          buildRow('armed', escapeHtml(stats.armed ? 'yes' : 'no')),
          buildRow('drains/yields', escapeHtml(`${stats.drains}/${stats.yields}`)),
          buildRow('maxDrainMs', escapeHtml(String(stats.maxDrainMs))),
          buildRow('clockJumps', escapeHtml(String(stats.clockJumps))),
          buildRow('state', escapeHtml(`${Math.round(stateSize() / 1024)} KiB`)),
          buildRow('boot', escapeHtml(`${s.boot.id} @ ${formatUtc(s.boot.at)}`)),
          buildRow(
            'adapters',
            escapeHtml(
              listAdapters()
                .map((a) => a.name)
                .join(', ') || '—'
            )
          ),
        ];
        whisper(playerId, t('titles.diagnostics', l), rows);
        return;
      }
      default:
        fail(playerId, 'unknownCommand', { command: `report ${verb}` });
    }
  }

  /**
   * `recovery preview|apply|acknowledge`.
   *
   * @param {string} playerId GM.
   * @param {object[]} words Words.
   * @returns {void}
   */
  function commandRecovery(playerId, words) {
    const verb = (words[0]?.text || '').toLowerCase();
    const parsed = parseOptions(words.slice(1), {
      incident: 'value',
      mode: 'value',
      token: 'value',
    });
    if (parsed.error) {
      fail(playerId, parsed.error, parsed.vars);
      return;
    }
    const { opts } = parsed;
    const l = lang();
    const s = getState();
    switch (verb) {
      case 'acknowledge':
        report(
          playerId,
          {
            ok: Boolean(acknowledgeIncident(opts.incident, playerId)),
            error: 'incidentNotFound',
            vars: { id: opts.incident || '' },
          },
          t('messages.acknowledged', l, { id: opts.incident || '' })
        );
        return;
      case 'preview': {
        const incident = s.incidents[opts.incident];
        if (!incident || incident.status === 'resolved') {
          fail(playerId, 'incidentNotFound', { id: opts.incident || '' });
          return;
        }
        const mode = opts.mode || 'runOnce';
        if (!['runOnce', 'skip'].includes(mode)) {
          fail(playerId, 'badMode', { modes: 'runOnce, skip' });
          return;
        }
        const token = issueConfirmation(playerId, 'recovery', {
          id: incident.id,
          mode,
          updatedAt: incident.updatedAt,
        });
        whisper(playerId, t('titles.recovery', l), [
          buildRow(t('labels.incident', l), escapeHtml(incident.id)),
          buildRow(t('labels.cause', l), escapeHtml(t(`causes.${incident.cause}`, l))),
          buildRow(t('labels.missed', l), escapeHtml(String(incident.count))),
          incident.range
            ? buildRow(
                t('labels.range', l),
                escapeHtml(`${formatUtc(incident.range.from)} → ${formatUtc(incident.range.to)}`)
              )
            : '',
          `<div>${escapeHtml(t(mode === 'runOnce' ? 'messages.recoveryRunOnce' : 'messages.recoverySkip', l))}</div>`,
          buildButton(t('buttons.apply', l), cmd('recovery', 'apply', '--token', token)),
        ]);
        return;
      }
      case 'apply': {
        const confirmation = consumeConfirmation(opts.token || '', playerId);
        if (!confirmation.ok || confirmation.op !== 'recovery') {
          fail(playerId, confirmation.reason || 'confirmationUnknown');
          return;
        }
        const incident = s.incidents[confirmation.payload.id];
        if (
          !incident ||
          incident.status === 'resolved' ||
          incident.updatedAt !== confirmation.payload.updatedAt
        ) {
          fail(playerId, 'stale', { id: confirmation.payload.id, rev: '—' });
          return;
        }
        const result = applyRecovery(incident, confirmation.payload.mode, playerId);
        report(
          playerId,
          result,
          t('messages.recovered', l, { id: incident.id, run: result.run || '—' })
        );
        return;
      }
      default:
        fail(playerId, 'unknownCommand', { command: `recovery ${verb}` });
    }
  }

  /**
   * `config show|set <key> <value>`.
   *
   * @param {string} playerId GM.
   * @param {object[]} words Words.
   * @returns {void}
   */
  function commandConfig(playerId, words) {
    const verb = (words[0]?.text || 'show').toLowerCase();
    const l = lang();
    if (verb === 'show') {
      const rows = Object.keys(DEFAULT_CONFIG).map((key) =>
        buildRow(key, escapeHtml(String(getConfig()[key])))
      );
      whisper(playerId, t('titles.config', l), rows);
      return;
    }
    if (verb === 'set') {
      const key = words[1]?.text || '';
      const result = setConfigValue(key, words[2]?.text);
      if (!result.valid) {
        fail(playerId, 'badConfig', { key });
        return;
      }
      markDirty();
      ok(playerId, t('messages.configSet', l, { key, value: String(result.value) }));
      return;
    }
    fail(playerId, 'unknownCommand', { command: `config ${verb}` });
  }

  /**
   * `adapter list`.
   *
   * @param {string} playerId GM.
   * @returns {void}
   */
  function commandAdapter(playerId) {
    const l = lang();
    const rows = listAdapters().map(
      (a) =>
        `<div><strong>${escapeHtml(a.name)}</strong> ${escapeHtml(String(a.version || ''))}: ${escapeHtml(Object.keys(a.actions).join(', '))}</div>`
    );
    whisper(
      playerId,
      t('titles.adapters', l),
      rows.length ? rows : escapeHtml(t('dashboard.noAdapters', l))
    );
  }

  /**
   * `stop-all --preview` / `--confirm <token>`: holds new admissions and
   * cancels active work. Already dispatched actions cannot be retracted.
   *
   * @param {string} playerId GM.
   * @param {object[]} words Words.
   * @returns {void}
   */
  function commandStopAll(playerId, words) {
    const parsed = parseOptions(words, { preview: 'flag', confirm: 'value' });
    if (parsed.error) {
      fail(playerId, parsed.error, parsed.vars);
      return;
    }
    const l = lang();
    const s = getState();
    const active = listInstances((i) => ACTIVE_STATUSES.has(i.status));
    const queued = Object.values(s.queues).reduce((n, q) => n + q.length, 0);
    if (!parsed.opts.confirm) {
      const token = issueConfirmation(playerId, 'stopAll', { count: active.length });
      whisper(playerId, t('titles.confirm', l), [
        `<div>${escapeHtml(t('messages.stopAllPreview', l, { runs: active.length, queued }))}</div>`,
        buildButton(t('buttons.confirmStop', l), cmd('stop-all', '--confirm', token)),
      ]);
      return;
    }
    const confirmation = consumeConfirmation(parsed.opts.confirm, playerId);
    if (!confirmation.ok || confirmation.op !== 'stopAll') {
      fail(playerId, confirmation.reason || 'confirmationUnknown');
      return;
    }
    s.halted = { at: now(), by: playerId };
    let cancelled = 0;
    for (const inst of active) {
      if (
        ACTIVE_STATUSES.has(getInstance(inst.id)?.status) &&
        cancelRun(inst.id, playerId, 'stopAll').ok
      ) {
        cancelled += 1;
      }
    }
    s.queues = {};
    audit('stopAll', { by: playerId, cancelled });
    markDirty();
    ok(playerId, t('messages.stopped', l, { count: cancelled }), [
      buildButton(t('dashboard.resumeAll', l), cmd('resume-all')),
    ]);
  }

  /**
   * `resume-all`: allows new admissions again after stop-all.
   *
   * @param {string} playerId GM.
   * @returns {void}
   */
  function commandResumeAll(playerId) {
    const s = getState();
    if (!s.halted) {
      fail(playerId, 'notHalted');
      return;
    }
    s.halted = null;
    audit('resumeAll', { by: playerId });
    markDirty();
    ok(playerId, t('messages.resumedAll', lang()));
  }

  // The GM-only Help handout.

  const STYLE = {
    outer: `background:${COLOR_CARD_BG_BOTTOM};color:${COLOR_TEXT};padding:14px 18px;border:1px solid ${COLOR_BORDER};border-radius:6px;font-family:Arial,sans-serif;line-height:1.5;`,
    header: `background:${COLOR_HEADER_BG};padding:12px;border-radius:4px;text-align:center;border-bottom:3px solid ${COLOR_ACCENT};margin-bottom:12px;`,
    h1: `color:${COLOR_HEADER_TEXT};margin:0;font-size:1.8em;letter-spacing:0.05em;`,
    subtitle: `color:${COLOR_MUTED};margin:4px 0 0 0;font-size:0.9em;`,
    h2: `color:${COLOR_ACCENT};border-bottom:1px solid ${COLOR_BORDER};padding-bottom:3px;margin:18px 0 8px 0;font-size:1.25em;`,
    p: `color:${COLOR_TEXT};margin:6px 0;`,
    li: `color:${COLOR_TEXT};margin:3px 0;`,
    table: 'width:100%;border-collapse:collapse;margin:6px 0;font-size:0.92em;',
    th: `background:${COLOR_HEADER_BG};color:${COLOR_HEADER_TEXT};padding:5px 8px;text-align:left;border:1px solid ${COLOR_BORDER};`,
    td: `padding:5px 8px;border:1px solid ${COLOR_BORDER};vertical-align:top;color:${COLOR_TEXT};`,
    code: 'font-family:monospace;color:#ffd58a;',
    link: `color:${COLOR_ACCENT};`,
    footer: `color:${COLOR_MUTED};font-size:0.85em;text-align:center;margin-top:16px;border-top:1px solid ${COLOR_BORDER};padding-top:8px;`,
  };

  /**
   * Builds a table.
   *
   * @param {string[]} headings Headings (escaped).
   * @param {string[][]} rows Cells (trusted HTML).
   * @returns {string} HTML.
   */
  function table(headings, rows) {
    const head = headings.map((h) => `<th style="${STYLE.th}">${escapeHtml(h)}</th>`).join('');
    const body = rows
      .map((cells) => `<tr>${cells.map((c) => `<td style="${STYLE.td}">${c}</td>`).join('')}</tr>`)
      .join('');
    return `<table style="${STYLE.table}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }

  /**
   * Builds a list from a translated array.
   *
   * @param {*} items Items.
   * @param {boolean} [ordered=false] Numbered.
   * @returns {string} HTML.
   */
  function list(items, ordered = false) {
    const tag = ordered ? 'ol' : 'ul';
    return `<${tag}>${(Array.isArray(items) ? items : []).map((item) => `<li style="${STYLE.li}">${escapeHtml(item)}</li>`).join('')}</${tag}>`;
  }

  /**
   * Builds the Help handout HTML.
   *
   * @param {string} locale Locale.
   * @returns {string} HTML.
   */
  function buildHelpHtml(locale) {
    const lang = getLocale(locale);
    const h = (key, vars) => escapeHtml(t(`handout.${key}`, lang, vars));
    const code = (text) => `<span style="${STYLE.code}">${escapeHtml(text)}</span>`;
    const section = (key, body) => `<h2 style="${STYLE.h2}">${h(`${key}.heading`)}</h2>${body}`;
    const commands = HELP_COMMANDS.map(([text, key]) => [
      code(`${COMMAND} ${text}`.trim()),
      escapeHtml(t(`help.${key}`, lang)),
    ]);
    const steps = Object.keys(STEP_SPECS).map((type) => [
      code(type),
      escapeHtml(t(`stepTypes.${type}`, lang)),
    ]);
    const triggers = ['manual', 'at', 'interval', 'daily', 'weekly', 'event', 'signal', 'chat'].map(
      (type) => [code(type), escapeHtml(t(`triggerTypes.${type}`, lang))]
    );
    const overdue = ['skip', 'runOnce', 'catchUpBounded', 'review', 'expire'].map((mode) => [
      code(mode),
      escapeHtml(t(`overdueModes.${mode}`, lang)),
    ]);
    const maintainer = AUTHOR_LINKS.maintainer;
    return [
      `<div style="${STYLE.outer}${getDirectionStyle(lang)}">`,
      `<div style="${STYLE.header}"><h1 style="${STYLE.h1}">${escapeHtml(SCRIPT_NAME)}</h1><p style="${STYLE.subtitle}">${h('subtitle', { version: SCRIPT_VERSION })}</p></div>`,
      `<p style="${STYLE.p}">${h('intro')}</p>`,
      section('quickStart', list(tRaw('handout.quickStart.items', lang), true)),
      section('concepts', list(tRaw('handout.concepts.items', lang))),
      section(
        'commands',
        table([t('handout.commands.command', lang), t('handout.commands.does', lang)], commands)
      ),
      section(
        'steps',
        table([t('handout.steps.type', lang), t('handout.steps.does', lang)], steps)
      ),
      section(
        'triggers',
        table([t('handout.triggers.type', lang), t('handout.triggers.does', lang)], triggers)
      ),
      section(
        'overdue',
        `<p style="${STYLE.p}">${h('overdue.intro')}</p>${table([t('handout.overdue.mode', lang), t('handout.overdue.does', lang)], overdue)}`
      ),
      section('limits', list(tRaw('handout.limits.items', lang))),
      `<div style="${STYLE.footer}">${h('footer', { name: maintainer.name })} · <a href="${escapeHtml(maintainer.github)}" style="${STYLE.link}">GitHub</a></div>`,
      '</div>',
    ].join('');
  }

  /**
   * Creates or updates the GM-only Help handout. The handout is only rewritten
   * when its content changes.
   *
   * @returns {object|null} Handout.
   */
  function installHelpHandout() {
    const s = getState();
    let handout = s.dashboard.helpHandoutId
      ? getObject('handout', s.dashboard.helpHandoutId)
      : null;
    if (!handout) {
      handout =
        findObjects({ _type: 'handout', name: HANDOUT_HELP_NAME })[0] ||
        createObject('handout', {
          name: HANDOUT_HELP_NAME,
          inplayerjournals: '',
          controlledby: '',
        });
    }
    if (!handout) {
      return null;
    }
    s.dashboard.helpHandoutId = handout.id;
    const html = buildHelpHtml(getConfig().language);
    const hash = hashText(html);
    if (s.dashboard.helpHash !== hash) {
      handout.set({ notes: html, inplayerjournals: '', controlledby: '' });
      s.dashboard.helpHash = hash;
    }
    return handout;
  }

  // Startup recovery (plan §8): admissions are held while persisted work is
  // reconciled, overdue schedules apply their policies once, observation gaps
  // are recorded, and the GM gets at most one concise summary.

  /**
   * Starts a new boot: records the previous last-observed time, which only
   * estimates when the sandbox stopped.
   *
   * @returns {{bootId: string, gapFrom: number|null, gapMs: number}} Boot info.
   */
  function startBoot() {
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
  function recoverState(boot) {
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
  function releaseAdmissions(summary) {
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
  function armMaintenance() {
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
  function registerRecoveryJobs() {
    onJob(JOB.MAINTENANCE, onMaintenance);
    onJob(JOB.CHECKPOINT, onCheckpoint);
  }

  /**
   * Builds the one-line facts of a recovery summary for the GM.
   *
   * @param {object} summary Summary.
   * @returns {boolean} True when there is anything worth saying.
   */
  function summaryWorthTelling(summary) {
    return Boolean(
      summary.runs || summary.review || summary.missed || summary.gaps || summary.reconciled
    );
  }

  /**
   * Wraps a handler so an exception is logged instead of stopping the sandbox.
   *
   * @param {string} label Handler name.
   * @param {Function} fn Handler.
   * @returns {Function} Wrapped handler.
   */
  function guarded(label, fn) {
    return (...args) => {
      if (!runtime.ready || runtime.disabled) {
        return;
      }
      try {
        fn(...args);
      } catch (err) {
        logLine(`ERROR in ${label}: ${err?.message || err}`);
        if (err?.stack) {
          log(err.stack);
        }
      }
    };
  }

  /**
   * Connects services that call each other through runtime hooks.
   *
   * @returns {void}
   */
  function wireHooks() {
    provide('dashboardDirty', () => markDirty());
    provide('emitEvent', (event) => emitInternal(event));
    provide('noteOwnWrite', (id, changes) => noteOwnWrite(id, changes));
    provide('awaitsChanged', () => awaitsChanged());
    provide('definitionChanged', (id) => {
      definitionsChanged();
      syncDefinitionSchedules(id);
      drainQueue(id);
    });
    provide('removeSchedule', (id, by) => removeSchedule(id, by));
    provide('runTerminal', (inst) => onRunTerminal(inst));
    provide('adapterKnown', (name) => Boolean(getAdapter(name)));
    provide('adapterStatus', (name, action, key) => {
      const fn = getAdapter(name)?.actions?.[action]?.status;
      return typeof fn === 'function' ? fn(key) : null;
    });
    provide('adapterRegistered', (name) => {
      if (!runtime.ready) {
        return;
      }
      const waiting = Object.values(getState().instances).filter(
        (i) => i.review?.reason === 'adapterUnavailable' && i.review?.vars?.adapter === name
      );
      if (waiting.length) {
        noticeGm(
          `adapter:${name}`,
          t('notices.adapterRegistered', getConfig().language, { name, count: waiting.length })
        );
      }
    });
    provide('notifyGm', (kind, vars) =>
      noticeGm(`${kind}:${vars.id || ''}`, t(`notices.${kind}`, getConfig().language, vars))
    );
  }

  /**
   * Publishes the API other Mods can call (plan §11). Registration is
   * idempotent; specs queued on globalThis.TaskAutomationQueue before this
   * Mod loaded are drained on ready.
   *
   * @returns {void}
   */
  function publishApi() {
    globalThis.TaskAutomation = Object.freeze({
      version: SCRIPT_VERSION,
      contract: ADAPTER_CONTRACT,
      /**
       * Registers a trusted adapter (see docs/ADAPTERS.md).
       *
       * @param {object} spec Adapter spec.
       * @returns {{ok: boolean, error?: string}} Result.
       */
      registerAdapter(spec) {
        return registerAdapter(spec);
      },
      /**
       * Registers an action provided by an adapter: shorthand for an adapter
       * with one action.
       *
       * @param {string} adapter Adapter name.
       * @param {string} action Action name.
       * @param {object} impl {invoke, replay, timeoutMs, status}.
       * @returns {{ok: boolean, error?: string}} Result.
       */
      registerAction(adapter, action, impl) {
        const existing = getAdapter(adapter);
        return registerAdapter({
          name: adapter,
          contract: ADAPTER_CONTRACT,
          version: existing?.version || '1',
          authority: existing?.authority || 'gm',
          actions: { ...(existing?.actions || {}), [action]: impl },
        });
      },
      /**
       * Registers an adapter event name so tasks can await or trigger on it.
       * Events are raised with `emit`.
       *
       * @param {string} adapter Adapter name.
       * @param {string} event Event name.
       * @returns {boolean} True when the adapter exists.
       */
      registerTrigger(adapter, event) {
        const existing = getAdapter(adapter);
        if (!existing) {
          return false;
        }
        registerAdapter({ ...existing, events: [...new Set([...(existing.events || []), event])] });
        return true;
      },
      /**
       * Raises an adapter event (`integration` events in task triggers).
       *
       * @param {string} adapter Adapter name.
       * @param {string} event Event name.
       * @param {*} value Scalar value.
       * @returns {boolean} True when routed.
       */
      emit(adapter, event, value) {
        if (!runtime.ready || !getAdapter(adapter)) {
          return false;
        }
        emitInternal({
          type: 'integration',
          adapter,
          name: toText(event).slice(0, 48),
          value: isRecord(value) ? null : (value ?? null),
          source: 'adapter',
        });
        return true;
      },
      /**
       * Raises a named signal from a trusted Mod. Not a person: it never has
       * GM rights.
       *
       * @param {string} name Signal name.
       * @param {*} value Scalar value.
       * @returns {boolean} True when routed.
       */
      signal(name, value) {
        if (!runtime.ready || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,47}$/.test(toText(name))) {
          return false;
        }
        raiseSignal(name, isRecord(value) ? null : (value ?? null), null, 'adapter');
        return true;
      },
      /**
       * Starts a GM-service definition. Definitions acting for a person
       * cannot be started from other Mods.
       *
       * @param {string} definitionId Definition ID.
       * @param {object} [options] {params, bindings: {name: [ids]}}.
       * @returns {string|null} Run ID, or null.
       */
      start(definitionId, options = {}) {
        const def = runtime.ready ? getSnapshot(definitionId) : null;
        if (!def || def.access?.authority !== 'gmService' || !getRecord(definitionId)?.enabled) {
          return null;
        }
        const result = admitRun(definitionId, {
          initiatorId: null,
          params: isRecord(options.params) ? options.params : {},
          bindings: isRecord(options.bindings) ? options.bindings : {},
          trigger: { type: 'api', id: 'api' },
        });
        return result.instance?.id || null;
      },
    });
  }

  /**
   * Startup (plan §8): load state, hold admissions, recover, then listen.
   *
   * @returns {void}
   */
  function checkInstall() {
    const loaded = initialiseState(Date.now());
    if (!['fresh', 'ok', 'migrated'].includes(loaded.status)) {
      // Fail closed: keep the stored data and run nothing.
      runtime.disabled = loaded;
      logLine(
        `ERROR: state not loaded (${loaded.status}${loaded.error ? `: ${loaded.error}` : ''}); no tasks will run.`
      );
      whisper(
        null,
        SCRIPT_NAME,
        `<div>${escapeHtml(t('notices.disabled', 'en-US', { status: loaded.status, version: loaded.from ?? '?' }))}</div>`
      );
      return;
    }
    applyGlobalConfig();
    wireHooks();
    createRuntimeScheduler();
    registerExecutorJobs();
    registerScheduleJobs();
    registerTriggerJobs();
    registerDashboardJobs();
    registerRecoveryJobs();
    registerReferenceAdapter();
    drainRegistrationQueue();
    publishApi();
    const boot = startBoot();
    runtime.ready = true;
    runtime.admissionsHeld = true;
    const summary = recoverState(boot);
    registerNativeHandlers(guarded);
    onEvent('destroy:handout', guarded('destroy:handout', onHandoutDestroyed));
    releaseAdmissions(summary);
    ensureDashboard();
    installHelpHandout();
    flushDashboard({ force: true });

    log(
      `-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] (${isJumpgate() ? 'Jumpgate' : 'Legacy'}) <=-`
    );
    const lang = getConfig().language;
    const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
    if (loaded.status === 'migrated') {
      lines.push(`<div>${escapeHtml(t('messages.migrated', lang, { from: loaded.from }))}</div>`);
    }
    if (summaryWorthTelling(summary)) {
      lines.push(
        `<div style="margin-top:3px">${escapeHtml(
          t('messages.recoverySummary', lang, {
            runs: summary.runs,
            review: summary.review,
            missed: summary.missed,
            admitted: summary.admitted,
            gaps: summary.gaps,
            gap: summary.gapMs ? formatDuration(summary.gapMs) : '—',
          })
        )}</div>`
      );
    }
    lines.push(
      `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang))}</div>`
    );
    whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
    if (loaded.status === 'fresh') {
      showMenu(null);
    }
  }

  /**
   * Registers the startup and command handlers. Object and campaign handlers
   * are registered after ready by the trigger router.
   *
   * @returns {void}
   */
  function registerEventHandlers() {
    onEvent('ready', () => {
      try {
        checkInstall();
      } catch (err) {
        runtime.disabled = { status: 'fatal', error: String(err?.message || err) };
        logLine(`ERROR during startup: ${err?.message || err}`);
        if (err?.stack) {
          log(err.stack);
        }
      }
    });
    onEvent('chat:message', (msg) => {
      if (runtime.ready || runtime.disabled) {
        handleInput(msg);
      }
    });
  }

  registerEventHandlers();
})();
